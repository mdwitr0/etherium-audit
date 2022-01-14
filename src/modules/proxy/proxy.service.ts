import {
  ETH_PROXY_SERVICE,
  IEthProxyService,
} from '@app/etherscan/modules/eth-proxy/eth-proxy.interfaces';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { instanceToPlain } from 'class-transformer';
import { Cache } from 'cache-manager';
import { InjectQueue } from '@nestjs/bull';
import { JOB_NAMES, QUEUE_NAMES } from '../../constants/queue.contacts';
import { Queue } from 'bull';
import { CACHE_KEYS, CACHE_TTLS } from '../../constants/cache.contacts';
import { Cron } from '@nestjs/schedule';
import { CRON_TIMES, GET_NUMBER_BLOCKS } from '../../constants/cron.constants';
import { BlockTransactionEntity } from './entities/blok-transactions.entity';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    @Inject(ETH_PROXY_SERVICE)
    private readonly ethProxyService: IEthProxyService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @InjectQueue(QUEUE_NAMES.BLOCK) private readonly proxyQueue: Queue,
  ) {
    this.cronUpdateBlocks();
  }

  /* Finds new and missing blocks in the cache and adds them to the queue */
  async findsLastBlocks(size: number): Promise<void> {
    this.logger.log(`Check last ${size} blocks`);

    const numberLastBlockResponse =
      await this.ethProxyService.getNumberLastBlock(
        this.configService.get('ETHERSCAN_API_KEY'),
      );
    const numberLastBlock: number = parseInt(numberLastBlockResponse.result);

    for (
      let blockNumber = numberLastBlock - size;
      blockNumber <= numberLastBlock;
      blockNumber++
    ) {
      const hexBlockNumber = this.getHexNumber(blockNumber);
      const cachedBlock = await this.cache.get(
        `${CACHE_KEYS.BLOCK}:${hexBlockNumber}`,
      );

      if (!cachedBlock)
        this.proxyQueue.add(JOB_NAMES.BLOCK_UPDATE, hexBlockNumber, {
          jobId: hexBlockNumber,
          lifo: true,
        });
    }

    this.cache.set(
      CACHE_KEYS.LATEST_BLOCK_NUMBER,
      numberLastBlockResponse.result,
      {
        ttl: CACHE_TTLS.BLOCK,
      },
    );
  }

  /* Saves in redis and returns the block and its transactions */
  async saveBlock(blockNumber: string): Promise<BlockTransactionEntity> {
    const blockResponse = await this.ethProxyService.getBlockByNumber(
      blockNumber,
      true,
      this.configService.get('ETHERSCAN_API_KEY'),
    );

    const block = <BlockTransactionEntity>(
      instanceToPlain(new BlockTransactionEntity(blockResponse.result), {
        strategy: 'excludeAll',
      })
    );

    this.cache.set(`${CACHE_KEYS.BLOCK}:${blockNumber}`, block, {
      ttl: CACHE_TTLS.BLOCK,
    });

    return block;
  }

  /* Calculates the sum of changes in the specified block range */
  async calculateChangeAddresses(
    startBlockNumber: number,
    size: number,
  ): Promise<{ [key: string]: number }> {
    const addresses = {};

    for (
      let blockNumber = startBlockNumber - size;
      blockNumber <= startBlockNumber;
      blockNumber++
    ) {
      let currentBlock: BlockTransactionEntity;
      currentBlock = await this.cache.get(
        `${CACHE_KEYS.BLOCK}:${this.getHexNumber(blockNumber)}`,
      );
      if (!currentBlock) {
        this.logger.debug(
          `Block not found in redis: ${this.getHexNumber(blockNumber)}`,
        );
        try {
          currentBlock = await this.saveBlock(this.getHexNumber(blockNumber));
        } catch (e) {
          currentBlock = await this.saveBlock(this.getHexNumber(blockNumber));
          this.logger.error(e);
        }
      }

      for (const transaction of currentBlock.transactions) {
        addresses[transaction.from] =
          addresses[transaction.from] + parseInt(transaction.value) ||
          parseInt(transaction.value);

        addresses[transaction.to] =
          addresses[transaction.to] + parseInt(transaction.value) ||
          parseInt(transaction.value);
      }
    }

    return addresses;
  }

  /* Returns the address whose value is greater than the others */
  async getLargeValueAddress(addresses: { [key: string]: number }) {
    const amount = Math.max.apply(
      null,
      Object.keys(addresses).map((key) => addresses[key]),
    );
    const hash = Object.keys(addresses).find(
      (key) => addresses[key] === amount,
    );

    return {
      hash: hash || '',
      amount: amount || 0,
    };
  }

  private getHexNumber(number: number): string {
    return `0x${number.toString(16)}`;
  }

  /* Starting block updates with cron */
  @Cron(CRON_TIMES.BLOCK_UPDATE)
  private async cronUpdateBlocks() {
    await this.findsLastBlocks(GET_NUMBER_BLOCKS);
  }
}
