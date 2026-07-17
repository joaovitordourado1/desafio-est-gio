import { AppError } from "../errors/app-error.js";
import type { AccountRepository } from "../repositories/account-repository.js";
import type { Account, CreateAccountData } from "../types/account.js";
import { MAX_MONEY_CENTS } from "../utils/money.js";

export class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  async create(data: CreateAccountData): Promise<Account> {
    const name = data.name.trim();

    if (!name) {
      throw new AppError("O nome da conta é obrigatório.", 400, "INVALID_ACCOUNT_NAME");
    }

    if (
      !Number.isSafeInteger(data.initialBalanceCents) ||
      data.initialBalanceCents < 0 ||
      data.initialBalanceCents > MAX_MONEY_CENTS
    ) {
      throw new AppError(
        "O saldo inicial informado é inválido.",
        400,
        "INVALID_INITIAL_BALANCE",
      );
    }

    return this.accountRepository.create({ ...data, name });
  }

  list(): Promise<Account[]> {
    return this.accountRepository.findAll();
  }
}
