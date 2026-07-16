import { AppError } from "../errors/app-error.js";
import type { AccountRepository } from "../repositories/account-repository.js";
import type { Account, CreateAccountData } from "../types/account.js";

export class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  async create(data: CreateAccountData): Promise<Account> {
    const name = data.name.trim();

    if (!name) {
      throw new AppError("O nome da conta é obrigatório.", 400, "INVALID_ACCOUNT_NAME");
    }

    if (!Number.isSafeInteger(data.initialBalanceCents) || data.initialBalanceCents < 0) {
      throw new AppError(
        "O saldo inicial deve ser maior ou igual a zero.",
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
