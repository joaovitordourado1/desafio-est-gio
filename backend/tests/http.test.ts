import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";
import { InMemoryAccountRepository } from "./in-memory-account-repository.js";

describe("API de contas", () => {
  let repository: InMemoryAccountRepository;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    repository = new InMemoryAccountRepository();
    app = createApp(repository);
  });

  it("cria e lista uma conta", async () => {
    const createResponse = await request(app).post("/accounts").send({
      name: "Conta principal",
      type: "CHECKING",
      initialBalance: "100.00",
    });

    assert.equal(createResponse.status, 201);
    assert.equal(createResponse.body.balance, "100.00");
    assert.match(createResponse.body.id, /^[0-9a-z-]+$/);

    const listResponse = await request(app).get("/accounts");

    assert.equal(listResponse.status, 200);
    assert.equal(listResponse.body.length, 1);
    assert.equal(listResponse.body[0].name, "Conta principal");
  });

  it("realiza saque e retorna tarifa e novo saldo", async () => {
    const account = await repository.create({
      name: "Conta corrente",
      type: "CHECKING",
      initialBalanceCents: 10_000,
    });

    const response = await request(app)
      .post(`/accounts/${account.id}/withdrawals`)
      .send({ amount: "50.00" });

    assert.equal(response.status, 200);
    assert.equal(response.body.amount, "50.00");
    assert.equal(response.body.fee, "1.00");
    assert.equal(response.body.account.balance, "49.00");
  });

  it("retorna 400 para body inválido", async () => {
    const response = await request(app).post("/accounts").send({
      name: "Conta",
      type: "INVALID",
      initialBalance: "100",
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, "VALIDATION_ERROR");
  });

  it("retorna 404 para conta inexistente", async () => {
    const response = await request(app)
      .post("/accounts/00000000-0000-4000-8000-000000000000/withdrawals")
      .send({ amount: "10.00" });

    assert.equal(response.status, 404);
    assert.equal(response.body.error.code, "ACCOUNT_NOT_FOUND");
  });
});
