import { AppError } from "../errors/app-error.js";
import type { TransactionManager } from "../transactions/transaction-manager.js";
import type { Account, TransferResult, WithdrawalResult } from "../types/account.js";

const CHECKING_FEE_CENTS = 100;
const CHECKING_MINIMUM_BALANCE_CENTS = -50_000;
const SAVINGS_MINIMUM_BALANCE_CENTS = 0;

export class OperationService {
  constructor(private readonly transactionManager: TransactionManager) {}

  async withdraw(accountId: string, amountCents: number): Promise<WithdrawalResult> {
    this.validateAmount(amountCents);

    return this.transactionManager.execute(async ({ accounts }) => {
      const account = await accounts.findById(accountId);

      if (!account) {
        throw new AppError("Conta não encontrada.", 404, "ACCOUNT_NOT_FOUND");
      }

      const { feeCents, newBalanceCents } = this.calculateDebit(account, amountCents);
      const updatedAccount = await accounts.updateBalance(account.id, newBalanceCents);

      return {
        account: updatedAccount,
        amountCents,
        feeCents,
      };
    });
  }

  async transfer(
    sourceAccountId: string,
    destinationAccountId: string,
    amountCents: number,
  ): Promise<TransferResult> {
    this.validateAmount(amountCents);

    if (sourceAccountId === destinationAccountId) {
      throw new AppError(
        "As contas de origem e destino devem ser diferentes.",
        400,
        "SAME_ACCOUNT_TRANSFER",
      );
    }

    return this.transactionManager.execute(async ({ accounts }) => {
      const sourceAccount = await accounts.findById(sourceAccountId);
      if (!sourceAccount) {
        throw new AppError(
          "Conta de origem não encontrada.",
          404,
          "SOURCE_ACCOUNT_NOT_FOUND",
        );
      }

      const destinationAccount = await accounts.findById(destinationAccountId);
      if (!destinationAccount) {
        throw new AppError(
          "Conta de destino não encontrada.",
          404,
          "DESTINATION_ACCOUNT_NOT_FOUND",
        );
      }

      const { feeCents, newBalanceCents } = this.calculateDebit(
        sourceAccount,
        amountCents,
      );
      const destinationBalanceCents = destinationAccount.balanceCents + amountCents;

      if (!Number.isSafeInteger(destinationBalanceCents)) {
        throw new AppError("O saldo resultante é inválido.", 400, "INVALID_BALANCE");
      }

      const updatedSourceAccount = await accounts.updateBalance(
        sourceAccount.id,
        newBalanceCents,
      );
      const updatedDestinationAccount = await accounts.updateBalance(
        destinationAccount.id,
        destinationBalanceCents,
      );

      return {
        sourceAccount: updatedSourceAccount,
        destinationAccount: updatedDestinationAccount,
        amountCents,
        feeCents,
      };
    });
  }

  private validateAmount(amountCents: number): void {
    if (!Number.isSafeInteger(amountCents) || amountCents <= 0) {
      throw new AppError("O valor deve ser maior que zero.", 400, "INVALID_AMOUNT");
    }
  }

  private calculateDebit(
    account: Account,
    amountCents: number,
  ): { feeCents: number; newBalanceCents: number } {
    const feeCents = account.type === "CHECKING" ? CHECKING_FEE_CENTS : 0;
    const newBalanceCents = account.balanceCents - amountCents - feeCents;
    const minimumBalanceCents =
      account.type === "CHECKING"
        ? CHECKING_MINIMUM_BALANCE_CENTS
        : SAVINGS_MINIMUM_BALANCE_CENTS;

    if (!Number.isSafeInteger(newBalanceCents) || newBalanceCents < minimumBalanceCents) {
      throw new AppError(
        "Saldo insuficiente para realizar a operação.",
        400,
        "INSUFFICIENT_FUNDS",
      );
    }

    return { feeCents, newBalanceCents };
  }
}
