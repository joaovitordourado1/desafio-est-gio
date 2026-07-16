import type { Account } from "../src/types/account.js";
import type {
  TransactionContext,
  TransactionManager,
} from "../src/transactions/transaction-manager.js";
import type { InMemoryAccountRepository } from "./in-memory-account-repository.js";

function cloneAccount(account: Account): Account {
  return {
    ...account,
    createdAt: new Date(account.createdAt),
    updatedAt: new Date(account.updatedAt),
  };
}

export class InMemoryTransactionManager implements TransactionManager {
  private tail: Promise<void> = Promise.resolve();

  constructor(private readonly accounts: InMemoryAccountRepository) {}

  async execute<T>(
    operation: (context: TransactionContext) => Promise<T>,
  ): Promise<T> {
    const previousTransaction = this.tail;
    let releaseTransaction: () => void = () => undefined;
    this.tail = new Promise((resolve) => {
      releaseTransaction = resolve;
    });

    await previousTransaction;
    const snapshot = this.accounts.accounts.map(cloneAccount);

    try {
      return await operation({ accounts: this.accounts });
    } catch (error) {
      this.accounts.accounts.splice(
        0,
        this.accounts.accounts.length,
        ...snapshot,
      );
      throw error;
    } finally {
      releaseTransaction();
    }
  }
}
