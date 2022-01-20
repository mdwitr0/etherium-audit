export const ETH_ACCOUNT_SERVICE = 'ETH_ACCOUNT_SERVICE';

export interface IEthAccountService {
  getMany(
    tag: string,
    address: string[],
    apikey: string,
  ): Promise<IAccountResponse>;

  getManyMock(
    tag: string,
    addresses: string[],
    apikey: string,
  ): Promise<IAccountResponse>;
}

export enum Modules {
  account = 'account',
}

export enum AccountActions {
  balancemulti = 'balancemulti',
}

export interface IAccountParams {
  module: keyof typeof Modules;
  address: string;
  apikey: string;
  action: keyof typeof AccountActions;
}

export interface IAccount {
  account: string;
  balance: string;
}

export interface IAccountResponse {
  status: string;
  message: string;
  result: IAccount[];
}
