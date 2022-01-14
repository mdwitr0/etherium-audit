import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { JOB_NAMES, QUEUE_NAMES } from '../../constants/queue.contacts';
import { ProxyService } from './proxy.service';

@Processor(QUEUE_NAMES.BLOCK)
export class ProxyProcessor {
  private readonly logger = new Logger(ProxyProcessor.name);

  constructor(private readonly proxyService: ProxyService) {}

  @Process(JOB_NAMES.BLOCK_UPDATE)
  async onProcess(job: Job<string>) {
    this.logger.debug(`Save block in redis:  ${job.data}`);
    this.proxyService.saveBlock(job.data);
  }
}
