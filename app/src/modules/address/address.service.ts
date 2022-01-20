import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';
import { Cache } from 'cache-manager';
import { CACHE_KEYS } from '../../constants/cache.contacts';
import {
  ETH_ACCOUNT_SERVICE,
  IEthAccountService,
} from '@app/etherscan/modules/eth-account/eth-account.interfaces';
import { ConfigService } from '@nestjs/config';
import { TransactionEntity } from '../proxy/entities/transactions.entity';
import { instanceToPlain } from 'class-transformer';
import { AddressBalanceEntity } from './entities/address-balance.entity';
import { IAddressesObject } from './address.interfaces';

@Injectable()
export class AddressService {
  constructor(
    private readonly configService: ConfigService,
    private readonly proxyService: ProxyService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @Inject(ETH_ACCOUNT_SERVICE)
    private readonly ethAccountService: IEthAccountService,
  ) {}

  /* Processes addresses in blocks and returns the maximal changed address */
  async findMostChanges(size: number) {
    const numberLatestBlock: string = await this.cache.get(
      CACHE_KEYS.LATEST_BLOCK_NUMBER,
    );

    const addresses = await this.calculateChangeAddresses(
      numberLatestBlock,
      size,
    );

    return await this.getLargeValueAddress(addresses);
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

  /* Calculates the sum of changes in the specified block range */
  async calculateChangeAddresses(
    startBlockNumber: string,
    size: number,
  ): Promise<{
    [key: string]: number;
  }> {
    const blockNumbers = await this.proxyService.getBlocksList(
      startBlockNumber,
      size,
    );

    const transactions = await this.proxyService.getBlocksTransactions(
      blockNumbers,
    );

    const addressesBalance = await this.getAddressesBalance(
      startBlockNumber,
      transactions,
    );
    const addresses: IAddressesObject = {};

    for (const transaction of transactions) {
      if (!addresses[transaction.from])
        addresses[transaction.from] = addressesBalance[transaction.from];
      if (!addresses[transaction.to])
        addresses[transaction.to] = addressesBalance[transaction.to];

      addresses[transaction.from] =
        addresses[transaction.from] - parseInt(transaction.value);

      addresses[transaction.to] =
        addresses[transaction.to] + parseInt(transaction.value);
    }

    for (const address in addresses) {
      addresses[address] = Math.abs(
        addresses[address] - addressesBalance[address],
      );
    }

    return addresses;
  }

  /* Returns the transformed object with address balances */
  async getAddressesBalance(
    blockNumber: string,
    transactions: TransactionEntity[],
  ) {
    const addresses = await this.getAddressesFromTransactions(transactions);
    const balances = await this.getAddresesBalanceByBlock(
      blockNumber,
      Object.keys(addresses),
    );

    for (const addressBalance of balances) {
      addresses[addressBalance.address] = Number(addressBalance.balance);
    }

    return addresses;
  }

  /* Returns the balance of all addresses */
  async getAddresesBalanceByBlock(
    tag: string,
    addresses: string[],
  ): Promise<AddressBalanceEntity[]> {
    // Gets the mock value of balances
    const accounts = await this.ethAccountService.getManyMock(
      tag,
      addresses,
      this.configService.get('ETHERSCAN_API_KEY'),
    );
    return accounts.result.map(
      (account) =>
        <AddressBalanceEntity>(
          instanceToPlain(new AddressBalanceEntity(account))
        ),
    );
  }

  /* Returns the address object created based on the transactions */
  async getAddressesFromTransactions(
    transactions: TransactionEntity[],
  ): Promise<IAddressesObject> {
    const addresses: IAddressesObject = {};

    for (const transaction of transactions) {
      addresses[transaction.from] = 0;
      addresses[transaction.to] = 0;
    }

    return addresses;
  }
}
