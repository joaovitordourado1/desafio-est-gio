export type AccountType = 'CHECKING' | 'SAVINGS'

export interface Account {
  id: string
  name: string
  type: AccountType
  balance: string
  createdAt: string
  updatedAt: string
}

export interface CreateAccountInput {
  name: string
  type: AccountType
  initialBalance: string
}

export interface WithdrawalResult {
  account: Account
  amount: string
  fee: string
}
