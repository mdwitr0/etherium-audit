import { Expose, Transform, Type } from 'class-transformer';
import { TransactionEntity } from './transactions.entity';
export class BlockTransactionEntity {
  @Expose()
  number: string;
  @Expose()
  @Type(() => TransactionEntity)
  @Transform(({ value }) =>
    value.filter((transaction) => parseInt(transaction.value)),
  )
  transactions: TransactionEntity[];

  constructor(partial: Partial<BlockTransactionEntity>) {
    Object.assign(this, partial);
  }
}
