import { getHttpConfig } from '@app/etherscan/configs/http.config';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ETH_ACCOUNT_SERVICE } from './eth-account.interfaces';
import { EthAccountService } from './eth-account.service';

@Module({
  providers: [
    EthAccountService,
    {
      provide: ETH_ACCOUNT_SERVICE,
      useClass: EthAccountService,
    },
  ],
  imports: [HttpModule.register(getHttpConfig())],
  exports: [
    {
      provide: ETH_ACCOUNT_SERVICE,
      useClass: EthAccountService,
    },
  ],
})
export class EthAccountModule {}
