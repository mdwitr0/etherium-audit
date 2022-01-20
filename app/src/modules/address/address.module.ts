import { CacheModule, Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { ProxyModule } from '../proxy/proxy.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getCacheConfig } from '../../configs/cache.config';
import { EthAccountModule } from '@app/etherscan/modules/eth-account/eth-account.module';

@Module({
  controllers: [AddressController],
  providers: [AddressService],
  imports: [
    ProxyModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getCacheConfig,
    }),
    EthAccountModule,
    ConfigModule,
  ],
})
export class AddressModule {}
