import { Expose } from 'class-transformer';

export class TransactionEntity {
  @Expose()
  from: string;
  @Expose()
  to: string;
  @Expose()
  value: string;
}
