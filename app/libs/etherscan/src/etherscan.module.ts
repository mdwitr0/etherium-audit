import { Module } from '@nestjs/common';
import { EtherscanService } from './etherscan.service';
import { EthProxyModule } from './modules/eth-proxy/eth-proxy.module';

@Module({
  providers: [EtherscanService],
  exports: [EtherscanService],
  imports: [EthProxyModule],
})
export class EtherscanModule {}
