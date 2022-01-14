import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AddressModule } from './modules/address/address.module';
import { ProxyModule } from './modules/proxy/proxy.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getQueueConfig } from './configs/queue.config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    AddressModule,
    ProxyModule,
    BullModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getQueueConfig,
    }),
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
