export const ACCOUNT_TYPES = ["CHECKING", "SAVINGS"] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balanceCents: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccountData {
  name: string;
  type: AccountType;
  initialBalanceCents: number;
}

export interface WithdrawalResult {
  account: Account;
  amountCents: number;
  feeCents: number;
}
