import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AppError } from "../src/errors/app-error.js";
import { AccountService } from "../src/services/account-service.js";
import { OperationService } from "../src/services/operation-service.js";
import { InMemoryAccountRepository } from "./in-memory-account-repository.js";
import { InMemoryTransactionManager } from "./in-memory-transaction-manager.js";

async function expectAppError(
  operation: () => Promise<unknown>,
  expectedCode: string,
): Promise<void> {
  await assert.rejects(operation, (error: unknown) => {
    return error instanceof AppError && error.code === expectedCode;
  });
}

describe("AccountService", () => {
  it("cria uma conta removendo espaços do nome", async () => {
    const repository = new InMemoryAccountRepository();
    const service = new AccountService(repository);

    const account = await service.create({
      name: "  Conta principal  ",
      type: "CHECKING",
      initialBalanceCents: 10_000,
    });

    assert.equal(account.name, "Conta principal");
    assert.equal(account.balanceCents, 10_000);
  });

  it("rejeita saldo inicial negativo", async () => {
    const service = new AccountService(new InMemoryAccountRepository());

    await expectAppError(
      () =>
        service.create({
          name: "Conta inválida",
          type: "SAVINGS",
          initialBalanceCents: -1,
        }),
      "INVALID_INITIAL_BALANCE",
    );
  });
});

describe("OperationService.withdraw", () => {
  it("cobra tarifa da corrente e aceita saldo final de -500.00", async () => {
    const repository = new InMemoryAccountRepository();
    const accountService = new AccountService(repository);
    const operationService = new OperationService(
      new InMemoryTransactionManager(repository),
    );
    const account = await accountService.create({
      name: "Conta corrente",
      type: "CHECKING",
      initialBalanceCents: 10_000,
    });

    const result = await operationService.withdraw(account.id, 59_900);

    assert.equal(result.feeCents, 100);
    assert.equal(result.account.balanceCents, -50_000);
  });

  it("rejeita corrente abaixo de -500.00 sem alterar o saldo", async () => {
    const repository = new InMemoryAccountRepository();
    const accountService = new AccountService(repository);
    const operationService = new OperationService(
      new InMemoryTransactionManager(repository),
    );
    const account = await accountService.create({
      name: "Conta corrente",
      type: "CHECKING",
      initialBalanceCents: 10_000,
    });

    await expectAppError(
      () => operationService.withdraw(account.id, 59_901),
      "INSUFFICIENT_FUNDS",
    );
    assert.equal(account.balanceCents, 10_000);
  });

  it("permite que a poupança chegue exatamente a zero sem tarifa", async () => {
    const repository = new InMemoryAccountRepository();
    const accountService = new AccountService(repository);
    const operationService = new OperationService(
      new InMemoryTransactionManager(repository),
    );
    const account = await accountService.create({
      name: "Poupança",
      type: "SAVINGS",
      initialBalanceCents: 10_000,
    });

    const result = await operationService.withdraw(account.id, 10_000);

    assert.equal(result.feeCents, 0);
    assert.equal(result.account.balanceCents, 0);
  });

  it("rejeita poupança negativa sem alterar o saldo", async () => {
    const repository = new InMemoryAccountRepository();
    const accountService = new AccountService(repository);
    const operationService = new OperationService(
      new InMemoryTransactionManager(repository),
    );
    const account = await accountService.create({
      name: "Poupança",
      type: "SAVINGS",
      initialBalanceCents: 10_000,
    });

    await expectAppError(
      () => operationService.withdraw(account.id, 10_001),
      "INSUFFICIENT_FUNDS",
    );
    assert.equal(account.balanceCents, 10_000);
  });

  it("rejeita valor zero", async () => {
    const repository = new InMemoryAccountRepository();
    const service = new OperationService(new InMemoryTransactionManager(repository));
    await expectAppError(() => service.withdraw("qualquer-id", 0), "INVALID_AMOUNT");
  });

  it("retorna erro quando a conta não existe", async () => {
    const repository = new InMemoryAccountRepository();
    const service = new OperationService(new InMemoryTransactionManager(repository));
    await expectAppError(() => service.withdraw("id-inexistente", 100), "ACCOUNT_NOT_FOUND");
  });
});

describe("OperationService.transfer", () => {
  it("transfere o valor e cobra tarifa da conta corrente de origem", async () => {
    const repository = new InMemoryAccountRepository();
    const accountService = new AccountService(repository);
    const operationService = new OperationService(
      new InMemoryTransactionManager(repository),
    );
    const source = await accountService.create({
      name: "Origem corrente",
      type: "CHECKING",
      initialBalanceCents: 10_000,
    });
    const destination = await accountService.create({
      name: "Destino poupança",
      type: "SAVINGS",
      initialBalanceCents: 2_000,
    });

    const result = await operationService.transfer(source.id, destination.id, 5_000);

    assert.equal(result.feeCents, 100);
    assert.equal(result.sourceAccount.balanceCents, 4_900);
    assert.equal(result.destinationAccount.balanceCents, 7_000);
  });

  it("rejeita transferência para a mesma conta", async () => {
    const repository = new InMemoryAccountRepository();
    const accountService = new AccountService(repository);
    const operationService = new OperationService(
      new InMemoryTransactionManager(repository),
    );
    const account = await accountService.create({
      name: "Conta única",
      type: "SAVINGS",
      initialBalanceCents: 10_000,
    });

    await expectAppError(
      () => operationService.transfer(account.id, account.id, 1_000),
      "SAME_ACCOUNT_TRANSFER",
    );
  });

  it("mantém os dois saldos quando a conta de origem não tem saldo", async () => {
    const repository = new InMemoryAccountRepository();
    const accountService = new AccountService(repository);
    const operationService = new OperationService(
      new InMemoryTransactionManager(repository),
    );
    const source = await accountService.create({
      name: "Origem poupança",
      type: "SAVINGS",
      initialBalanceCents: 1_000,
    });
    const destination = await accountService.create({
      name: "Destino",
      type: "CHECKING",
      initialBalanceCents: 2_000,
    });

    await expectAppError(
      () => operationService.transfer(source.id, destination.id, 1_001),
      "INSUFFICIENT_FUNDS",
    );

    assert.equal((await repository.findById(source.id))?.balanceCents, 1_000);
    assert.equal((await repository.findById(destination.id))?.balanceCents, 2_000);
  });

  it("desfaz o débito quando a atualização do destino falha", async () => {
    class FailingDestinationRepository extends InMemoryAccountRepository {
      failingAccountId: string | undefined;

      override async updateBalance(id: string, balanceCents: number) {
        if (id === this.failingAccountId) {
          throw new Error("Falha simulada ao atualizar o destino.");
        }

        return super.updateBalance(id, balanceCents);
      }
    }

    const repository = new FailingDestinationRepository();
    const accountService = new AccountService(repository);
    const operationService = new OperationService(
      new InMemoryTransactionManager(repository),
    );
    const source = await accountService.create({
      name: "Origem",
      type: "CHECKING",
      initialBalanceCents: 10_000,
    });
    const destination = await accountService.create({
      name: "Destino",
      type: "SAVINGS",
      initialBalanceCents: 2_000,
    });
    repository.failingAccountId = destination.id;

    await assert.rejects(() =>
      operationService.transfer(source.id, destination.id, 5_000),
    );

    assert.equal((await repository.findById(source.id))?.balanceCents, 10_000);
    assert.equal((await repository.findById(destination.id))?.balanceCents, 2_000);
  });
});
