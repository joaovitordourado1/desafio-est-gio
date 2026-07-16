import { prisma } from "../database/prisma.js";
import { PrismaAccountRepository } from "../repositories/prisma-account-repository.js";
import type {
  TransactionContext,
  TransactionManager,
} from "./transaction-manager.js";

const MAX_TRANSACTION_ATTEMPTS = 3;

function isWriteConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2034"
  );
}

export class PrismaTransactionManager implements TransactionManager {
  async execute<T>(
    operation: (context: TransactionContext) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 1; attempt <= MAX_TRANSACTION_ATTEMPTS; attempt += 1) {
      try {
        return await prisma.$transaction(
          async (transaction) =>
            operation({
              accounts: new PrismaAccountRepository(transaction),
            }),
          { isolationLevel: "Serializable" },
        );
      } catch (error) {
        if (!isWriteConflict(error) || attempt === MAX_TRANSACTION_ATTEMPTS) {
          throw error;
        }
      }
    }

    throw new Error("A transação não pôde ser concluída.");
  }
}
