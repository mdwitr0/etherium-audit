import { HttpModuleOptions } from '@nestjs/axios';

export const getHttpConfig = (): HttpModuleOptions => ({
  baseURL: 'https://api.etherscan.io/',
});
