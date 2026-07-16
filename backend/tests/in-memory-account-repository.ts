import { randomUUID } from "node:crypto";
import type { AccountRepository } from "../src/repositories/account-repository.js";
import type { Account, CreateAccountData } from "../src/types/account.js";

export class InMemoryAccountRepository implements AccountRepository {
  readonly accounts: Account[] = [];

  async create(data: CreateAccountData): Promise<Account> {
    const now = new Date();
    const account: Account = {
      id: randomUUID(),
      name: data.name,
      type: data.type,
      balanceCents: data.initialBalanceCents,
      createdAt: now,
      updatedAt: now,
    };

    this.accounts.push(account);
    return account;
  }

  async findAll(): Promise<Account[]> {
    return [...this.accounts];
  }

  async findById(id: string): Promise<Account | null> {
    return this.accounts.find((account) => account.id === id) ?? null;
  }

  async updateBalance(id: string, balanceCents: number): Promise<Account> {
    const account = this.accounts.find((item) => item.id === id);

    if (!account) {
      throw new Error("Conta não encontrada no repository em memória.");
    }

    account.balanceCents = balanceCents;
    account.updatedAt = new Date();
    return account;
  }
}
