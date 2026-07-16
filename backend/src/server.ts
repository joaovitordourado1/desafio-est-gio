import "dotenv/config";
import { createApp } from "./app.js";
import { PrismaAccountRepository } from "./repositories/prisma-account-repository.js";
import { PrismaTransactionManager } from "./transactions/prisma-transaction-manager.js";

const port = Number(process.env.PORT ?? 3000);
const app = createApp({
  accountRepository: new PrismaAccountRepository(),
  transactionManager: new PrismaTransactionManager(),
});

app.listen(port, () => {
  console.log(`API disponível em http://localhost:${port}`);
});
