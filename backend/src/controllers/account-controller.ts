import type { Request, Response } from "express";
import type { AccountService } from "../services/account-service.js";
import type { OperationService } from "../services/operation-service.js";
import {
  presentAccount,
  presentTransfer,
  presentWithdrawal,
} from "../presenters/account-presenter.js";
import type { AccountType } from "../types/account.js";

interface CreateAccountBody {
  name: string;
  type: AccountType;
  initialBalance: number;
}

interface WithdrawalBody {
  amount: number;
}

interface TransferBody {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
}

export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly operationService: OperationService,
  ) {}

  create = async (
    request: Request<Record<string, never>, unknown, CreateAccountBody>,
    response: Response,
  ): Promise<void> => {
    const account = await this.accountService.create({
      name: request.body.name,
      type: request.body.type,
      initialBalanceCents: request.body.initialBalance,
    });

    response.status(201).json(presentAccount(account));
  };

  list = async (_request: Request, response: Response): Promise<void> => {
    const accounts = await this.accountService.list();
    response.json(accounts.map(presentAccount));
  };

  withdraw = async (
    request: Request<{ id: string }, unknown, WithdrawalBody>,
    response: Response,
  ): Promise<void> => {
    const result = await this.operationService.withdraw(request.params.id, request.body.amount);
    response.json(presentWithdrawal(result));
  };

  transfer = async (
    request: Request<Record<string, never>, unknown, TransferBody>,
    response: Response,
  ): Promise<void> => {
    const result = await this.operationService.transfer(
      request.body.sourceAccountId,
      request.body.destinationAccountId,
      request.body.amount,
    );

    response.json(presentTransfer(result));
  };
}
