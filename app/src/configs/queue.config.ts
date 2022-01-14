import { ConfigService } from '@nestjs/config';
import { QueueOptions } from 'bull';

export const getQueueConfig = async (
  configService: ConfigService,
): Promise<QueueOptions> => ({
  redis: {
    host: configService.get('REDIS_HOST'),
    port: configService.get('REDIS_PORT'),
  },
  limiter: {
    max: 1,
    duration: 350,
  },
  defaultJobOptions: {
    removeOnComplete: true,
    attempts: 10,
  },
  settings: {
    stalledInterval: 1000,
    maxStalledCount: 3,
  },
});
