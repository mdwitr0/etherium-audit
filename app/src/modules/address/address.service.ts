import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';
import { Cache } from 'cache-manager';
import { CACHE_KEYS } from '../../constants/cache.contacts';

@Injectable()
export class AddressService {
  constructor(
    private readonly proxyService: ProxyService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  /* Processes addresses in blocks and returns the maximal changed address */
  async findMostChanges(size: number) {
    const numberLatestBlock: string = await this.cache.get(
      CACHE_KEYS.LATEST_BLOCK_NUMBER,
    );
    const numberLastBlock: number = parseInt(numberLatestBlock);

    const addresses = await this.proxyService.calculateChangeAddresses(
      numberLastBlock,
      size,
    );

    return await this.proxyService.getLargeValueAddress(addresses);
  }
}
