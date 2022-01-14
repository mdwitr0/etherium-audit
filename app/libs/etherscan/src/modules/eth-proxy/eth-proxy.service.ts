import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom, map } from 'rxjs';
import {
  IProxyBlockByNumberParams,
  IProxyBlockByNumberResult,
  IProxyParams,
  IProxyResponse,
  Modules,
  ProxyActions,
} from './eth-proxy.interfaces';

@Injectable()
export class EthProxyService {
  constructor(private readonly httpService: HttpService) {}

  async getNumberLastBlock(apikey: string): Promise<IProxyResponse<string>> {
    return firstValueFrom(
      this.httpService
        .get('api', {
          params: <IProxyParams>{
            apikey,
            module: Modules.proxy,
            action: ProxyActions.eth_blockNumber,
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

  async getBlockByNumber(
    tag: string,
    boolean: boolean,
    apikey: string,
  ): Promise<IProxyResponse<IProxyBlockByNumberResult>> {
    return firstValueFrom(
      this.httpService
        .get('api', {
          params: <IProxyBlockByNumberParams>{
            apikey,
            tag,
            boolean,
            module: Modules.proxy,
            action: ProxyActions.eth_getBlockByNumber,
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
}
