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
import { TransactionEntity } from './entities/transactions.entity';

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

  /* Calculates the sum of changes in the specified block range */
  async calculateChangeAddresses(
    startBlockNumber: string,
    size: number,
  ): Promise<{
    [key: string]: number;
  }> {
    const blockNumbers = await this.getBlocksList(startBlockNumber, size);

    const transactions = await this.getBlocksTransactions(blockNumbers);

    const addresses = {};

    for (const transaction of transactions) {
      addresses[transaction.from] =
        addresses[transaction.from] + parseInt(transaction.value) ||
        parseInt(transaction.value);

      addresses[transaction.to] =
        addresses[transaction.to] + parseInt(transaction.value) ||
        parseInt(transaction.value);
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

  /* Saves in redis and returns the block and its transactions */
  async saveBlock(blockNumber: string): Promise<BlockTransactionEntity> {
    const blockResponse = await this.ethProxyService.getBlockByNumber(
      blockNumber,
      true,
      this.configService.get('ETHERSCAN_API_KEY'),
    );

    let block: BlockTransactionEntity;

    try {
      block = <BlockTransactionEntity>(
        instanceToPlain(new BlockTransactionEntity(blockResponse.result), {
          strategy: 'excludeAll',
        })
      );
    } catch (e) {
      this.logger.error(`Error saving block: ${blockNumber}`, e);

      await setTimeout(() => {}, 1000);
      block = <BlockTransactionEntity>(
        instanceToPlain(new BlockTransactionEntity(blockResponse.result), {
          strategy: 'excludeAll',
        })
      );
    }

    this.cache.set(`${CACHE_KEYS.BLOCK}:${blockNumber}`, block, {
      ttl: CACHE_TTLS.BLOCK,
    });

    return block;
  }

  /* Find new and missing blocks in the cache and adds them to the queue */
  async findLastBlocks(size: number): Promise<void> {
    this.logger.log(`Check last ${size} blocks`);

    const numberLastBlockResponse =
      await this.ethProxyService.getNumberLastBlock(
        this.configService.get('ETHERSCAN_API_KEY'),
      );
    const blockNumbers = await this.getBlocksList(
      numberLastBlockResponse,
      size,
    );

    for (const blockNumber of blockNumbers) {
      const cachedBlock = await this.cache.get(
        `${CACHE_KEYS.BLOCK}:${blockNumber}`,
      );

      if (!cachedBlock)
        this.proxyQueue.add(JOB_NAMES.BLOCK_UPDATE, blockNumber, {
          jobId: blockNumber,
          lifo: true,
        });
    }

    this.cache.set(CACHE_KEYS.LATEST_BLOCK_NUMBER, numberLastBlockResponse, {
      ttl: CACHE_TTLS.BLOCK,
    });
  }

  /* Returns transactions from all blocks specified in blockNumbers */
  async getBlocksTransactions(blockNumbers): Promise<TransactionEntity[]> {
    let transactions: TransactionEntity[] = [];

    for (const blockNumber of blockNumbers) {
      let currentBlock: BlockTransactionEntity;

      currentBlock = await this.cache.get(`${CACHE_KEYS.BLOCK}:${blockNumber}`);
      if (!currentBlock) {
        this.logger.debug(`Block not found in redis: ${blockNumber}`);
        currentBlock = await this.saveBlock(blockNumber);
      }

      transactions = transactions.concat(currentBlock.transactions);
    }

    return transactions;
  }

  /*
   * Returns an array of block numbers.
   * The array contains blocks from blockStartNumber to blockStartNumber - size
   */
  async getBlocksList(
    blockStartNumber: string,
    size: number,
  ): Promise<string[]> {
    const blockNumbers: string[] = [];

    const blockNumber: number = parseInt(blockStartNumber);

    for (let number = blockNumber - size; number <= blockNumber; number++) {
      blockNumbers.push(this.getHexNumber(number));
    }

    return blockNumbers;
  }

  private getHexNumber(number: number): string {
    return `0x${number.toString(16)}`;
  }

  /* Starting block updates with cron */
  @Cron(CRON_TIMES.BLOCK_UPDATE)
  private async cronUpdateBlocks() {
    await this.findLastBlocks(GET_NUMBER_BLOCKS);
  }
}
