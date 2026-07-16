import type { AccountRepository } from "../repositories/account-repository.js";

export interface TransactionContext {
  accounts: AccountRepository;
}

export interface TransactionManager {
  execute<T>(operation: (context: TransactionContext) => Promise<T>): Promise<T>;
}
