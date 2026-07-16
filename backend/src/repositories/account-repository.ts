import type { Account, CreateAccountData } from "../types/account.js";

export interface AccountRepository {
  create(data: CreateAccountData): Promise<Account>;
  findAll(): Promise<Account[]>;
  findById(id: string): Promise<Account | null>;
  updateBalance(id: string, balanceCents: number): Promise<Account>;
}
