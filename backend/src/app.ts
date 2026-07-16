import cors from "cors";
import express, { type Express } from "express";
import { AccountController } from "./controllers/account-controller.js";
import { AppError } from "./errors/app-error.js";
import { errorHandler } from "./middlewares/error-handler.js";
import type { AccountRepository } from "./repositories/account-repository.js";
import { createAccountRouter } from "./routes/account-routes.js";
import { createTransferRouter } from "./routes/transfer-routes.js";
import { AccountService } from "./services/account-service.js";
import { OperationService } from "./services/operation-service.js";
import type { TransactionManager } from "./transactions/transaction-manager.js";

interface AppDependencies {
  accountRepository: AccountRepository;
  transactionManager: TransactionManager;
}

export function createApp({
  accountRepository,
  transactionManager,
}: AppDependencies): Express {
  const app = express();
  const accountService = new AccountService(accountRepository);
  const operationService = new OperationService(transactionManager);
  const accountController = new AccountController(accountService, operationService);

  app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173" }));
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });
  app.use("/accounts", createAccountRouter(accountController));
  app.use("/transfers", createTransferRouter(accountController));

  app.use((_request, _response, next) => {
    next(new AppError("Rota não encontrada.", 404, "ROUTE_NOT_FOUND"));
  });
  app.use(errorHandler);

  return app;
}
