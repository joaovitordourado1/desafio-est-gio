import { AppError } from "../errors/app-error.js";

const MONEY_PATTERN = /^(0|[1-9]\d*)\.\d{2}$/;
export const MAX_MONEY_CENTS = 2_147_483_647;

export function moneyToCents(value: string): number {
  if (!MONEY_PATTERN.test(value)) {
    throw new AppError(
      "Use um valor monetário com duas casas decimais, como 50.00.",
      400,
      "INVALID_MONEY",
    );
  }

  const [whole, decimal] = value.split(".");
  const cents = Number(whole) * 100 + Number(decimal);

  if (!Number.isSafeInteger(cents) || cents > MAX_MONEY_CENTS) {
    throw new AppError("O valor monetário é muito alto.", 400, "INVALID_MONEY");
  }

  return cents;
}

export function centsToMoney(value: number): string {
  return (value / 100).toFixed(2);
}
