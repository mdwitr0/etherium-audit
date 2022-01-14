import { Expose, Transform, Type } from 'class-transformer';

class Transaction {
  @Expose()
  from: string;
  @Expose()
  to: string;
  @Expose()
  value: string;
}

export class BlockTransactionEntity {
  @Expose()
  number: string;
  @Expose()
  @Type(() => Transaction)
  @Transform(({ value }) =>
    value.filter((transaction) => parseInt(transaction.value)),
  )
  transactions: Transaction[];

  constructor(partial: Partial<BlockTransactionEntity>) {
    Object.assign(this, partial);
  }
}
