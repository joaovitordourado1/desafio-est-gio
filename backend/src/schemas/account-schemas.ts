import { z } from "zod";
import { ACCOUNT_TYPES } from "../types/account.js";
import { moneyToCents } from "../utils/money.js";

const moneySchema = z
  .string()
  .regex(/^\d+\.\d{2}$/, "Use um valor com duas casas decimais, como 50.00.")
  .transform(moneyToCents);

export const createAccountSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    type: z.enum(ACCOUNT_TYPES),
    initialBalance: moneySchema,
  }),
});

export const withdrawalSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    amount: moneySchema.refine((amount) => amount > 0, {
      message: "O valor do saque deve ser maior que zero.",
    }),
  }),
});

export const transferSchema = z.object({
  body: z.object({
    sourceAccountId: z.string().uuid(),
    destinationAccountId: z.string().uuid(),
    amount: moneySchema.refine((amount) => amount > 0, {
      message: "O valor da transferência deve ser maior que zero.",
    }),
  }),
});
