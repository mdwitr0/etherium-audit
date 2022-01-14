import { getHttpConfig } from '@app/etherscan/configs/http.config';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ETH_PROXY_SERVICE } from './eth-proxy.interfaces';
import { EthProxyService } from './eth-proxy.service';

@Module({
  providers: [
    EthProxyService,
    {
      provide: ETH_PROXY_SERVICE,
      useClass: EthProxyService,
    },
  ],
  imports: [HttpModule.register(getHttpConfig())],
  exports: [
    {
      provide: ETH_PROXY_SERVICE,
      useClass: EthProxyService,
    },
  ],
})
export class EthProxyModule {}
