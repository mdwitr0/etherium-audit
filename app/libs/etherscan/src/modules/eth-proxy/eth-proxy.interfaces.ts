export const ETH_PROXY_SERVICE = 'ETH_PROXY_SERVICE';

export interface IEthProxyService {
  getNumberLastBlock(apikey: string): Promise<string>;

  getBlockByNumber(
    tag: string,
    boolean: boolean,
    apikey: string,
  ): Promise<IProxyResponse<IProxyBlockByNumberResult>>;
}

export enum Modules {
  proxy = 'proxy',
}

export enum ProxyActions {
  eth_blockNumber = 'eth_blockNumber',
  eth_getBlockByNumber = 'eth_getBlockByNumber',
}

export interface IProxyParams {
  module: keyof typeof Modules;
  apikey: string;
  action: keyof typeof ProxyActions;
}

export interface IProxyBlockByNumberParams extends IProxyParams {
  tag: string;
  boolean: boolean;
}

export interface IProxyResponse<R> {
  jsonrpc: string;
  id: number;
  result: R;
}

export interface ITransaction {
  blockHash: string;
  blockNumber: string;
  from: string;
  gas: string;
  gasPrice: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  hash: string;
  input: string;
  nonce: string;
  to: string;
  transactionIndex: string;
  value: string;
  type: string;
  accessList: [];
  chainId: string;
  v: string;
  r: string;
  s: string;
}

export interface IProxyBlockByNumberResult {
  baseFeePerGas: string;
  difficulty: string;
  extraData: string;
  gasLimit: string;
  gasUsed: string;
  hash: string;
  logsBloom: string;
  miner: string;
  mixHash: string;
  nonce: string;
  number: string;
  parentHash: string;
  receiptsRoot: string;
  sha3Uncles: string;
  size: string;
  stateRoot: string;
  timestamp: string;
  totalDifficulty: string;
  transactions: ITransaction[];
  transactionsRoot: string;
  uncles: string[];
}
