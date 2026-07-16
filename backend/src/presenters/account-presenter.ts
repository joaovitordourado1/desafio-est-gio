import type { Account, TransferResult, WithdrawalResult } from "../types/account.js";
import { centsToMoney } from "../utils/money.js";

export function presentAccount(account: Account) {
  return {
    id: account.id,
    name: account.name,
    type: account.type,
    balance: centsToMoney(account.balanceCents),
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
}

export function presentWithdrawal(result: WithdrawalResult) {
  return {
    account: presentAccount(result.account),
    amount: centsToMoney(result.amountCents),
    fee: centsToMoney(result.feeCents),
  };
}

export function presentTransfer(result: TransferResult) {
  return {
    sourceAccount: presentAccount(result.sourceAccount),
    destinationAccount: presentAccount(result.destinationAccount),
    amount: centsToMoney(result.amountCents),
    fee: centsToMoney(result.feeCents),
  };
}
