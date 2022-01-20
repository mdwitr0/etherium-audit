import { Exclude, Expose, Transform, Type } from 'class-transformer';

export class AddressBalanceEntity {
  @Exclude()
  account: string;

  @Expose()
  get address(): string {
    return this.account;
  }

  @Expose()
  @Type(() => Number)
  balance: string;

  constructor(partial: Partial<AddressBalanceEntity>) {
    Object.assign(this, partial);
  }
}
