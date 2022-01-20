import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom, map } from 'rxjs';
import {
  AccountActions,
  IAccount,
  IAccountParams,
  IAccountResponse,
  Modules,
} from './eth-account.interfaces';

@Injectable()
export class EthAccountService {
  constructor(private readonly httpService: HttpService) {}

  async getMany(
    tag: string,
    addresses: string[],
    apikey: string,
  ): Promise<IAccountResponse> {
    return firstValueFrom(
      this.httpService
        .get('api', {
          params: <IAccountParams>{
            apikey,
            address: addresses.join(','),
            tag,
            module: Modules.account,
            action: AccountActions.balancemulti,
          },
        })
        .pipe(
          map((response) => {
            if (response.data.message === 'NOTOK')
              throw new Error(response.data.result);
            return response.data;
          }),
          catchError((error) => {
            throw new Error(error);
          }),
        ),
    );
  }

  async getManyMock(
    tag: string,
    addresses: string[],
    apikey: string,
  ): Promise<IAccountResponse> {
    const accounts: IAccount[] = addresses.map((address) => ({
      account: address,
      balance: '100000000000000000000000000',
    }));

    return {
      status: '1',
      message: 'OK',
      result: accounts,
    };
  }
}
