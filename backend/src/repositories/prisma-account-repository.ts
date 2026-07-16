import type {
  Account as PrismaAccount,
  Prisma,
  PrismaClient,
} from "../generated/prisma/client.js";
import type { Account, CreateAccountData } from "../types/account.js";
import { prisma } from "../database/prisma.js";
import type { AccountRepository } from "./account-repository.js";

function toAccount(account: PrismaAccount): Account {
  return {
    id: account.id,
    name: account.name,
    type: account.type,
    balanceCents: account.balanceCents,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

export class PrismaAccountRepository implements AccountRepository {
  constructor(
    private readonly client: PrismaClient | Prisma.TransactionClient = prisma,
  ) {}

  async create(data: CreateAccountData): Promise<Account> {
    const account = await this.client.account.create({
      data: {
        name: data.name,
        type: data.type,
        balanceCents: data.initialBalanceCents,
      },
    });

    return toAccount(account);
  }

  async findAll(): Promise<Account[]> {
    const accounts = await this.client.account.findMany({
      orderBy: { createdAt: "desc" },
    });

    return accounts.map(toAccount);
  }

  async findById(id: string): Promise<Account | null> {
    const account = await this.client.account.findUnique({ where: { id } });
    return account ? toAccount(account) : null;
  }

  async updateBalance(id: string, balanceCents: number): Promise<Account> {
    const account = await this.client.account.update({
      where: { id },
      data: { balanceCents },
    });

    return toAccount(account);
  }
}
