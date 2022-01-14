import { EthProxyModule } from '@app/etherscan/modules/eth-proxy/eth-proxy.module';
import { BullModule } from '@nestjs/bull';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getCacheConfig } from '../../configs/cache.config';
import { QUEUE_NAMES } from '../../constants/queue.contacts';
import { ProxyProcessor } from './proxy.processor';
import { ProxyService } from './proxy.service';

@Module({
  providers: [ProxyService, ProxyProcessor],
  imports: [
    EthProxyModule,
    ConfigModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getCacheConfig,
    }),
    BullModule.registerQueue({
      name: QUEUE_NAMES.BLOCK,
    }),
  ],
  exports: [ProxyService],
})
export class ProxyModule {}
