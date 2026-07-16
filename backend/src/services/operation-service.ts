import { AppError } from "../errors/app-error.js";
import type { AccountRepository } from "../repositories/account-repository.js";
import type { WithdrawalResult } from "../types/account.js";

const CHECKING_FEE_CENTS = 100;
const CHECKING_MINIMUM_BALANCE_CENTS = -50_000;
const SAVINGS_MINIMUM_BALANCE_CENTS = 0;

export class OperationService {
  constructor(private readonly accountRepository: AccountRepository) {}

  async withdraw(accountId: string, amountCents: number): Promise<WithdrawalResult> {
    if (!Number.isSafeInteger(amountCents) || amountCents <= 0) {
      throw new AppError("O valor do saque deve ser maior que zero.", 400, "INVALID_AMOUNT");
    }

    const account = await this.accountRepository.findById(accountId);

    if (!account) {
      throw new AppError("Conta não encontrada.", 404, "ACCOUNT_NOT_FOUND");
    }

    const feeCents = account.type === "CHECKING" ? CHECKING_FEE_CENTS : 0;
    const newBalanceCents = account.balanceCents - amountCents - feeCents;
    const minimumBalanceCents =
      account.type === "CHECKING"
        ? CHECKING_MINIMUM_BALANCE_CENTS
        : SAVINGS_MINIMUM_BALANCE_CENTS;

    if (newBalanceCents < minimumBalanceCents) {
      throw new AppError(
        "Saldo insuficiente para realizar o saque.",
        400,
        "INSUFFICIENT_FUNDS",
      );
    }

    const updatedAccount = await this.accountRepository.updateBalance(
      account.id,
      newBalanceCents,
    );

    return {
      account: updatedAccount,
      amountCents,
      feeCents,
    };
  }
}
