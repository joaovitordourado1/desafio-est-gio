# Banco Agilize

Aplicação fullstack para criação e movimentação de contas correntes e poupanças. O projeto implementa o saque obrigatório e, como diferencial, transferências atômicas com rollback.

## Stack

- **Backend:** Node.js 24, TypeScript, Express, Zod e Prisma ORM.
- **Frontend:** React 19, TypeScript e Vite.
- **Banco de dados:** PostgreSQL 18.
- **Infraestrutura:** Docker e Docker Compose.
- **Testes:** Node.js Test Runner e Supertest.

## Executar com Docker — recomendado

### Pré-requisitos

- Git.
- Docker com o plugin Docker Compose.

Clone o repositório e suba todos os serviços:

```bash
git clone https://github.com/joaovitordourado1/desafio-est-gio.git
cd desafio-est-gio
docker compose up --build -d
```

Na primeira execução, o backend aguarda o PostgreSQL ficar disponível e aplica as migrations automaticamente. Confira se os três serviços estão saudáveis:

```bash
docker compose ps
```

Acesse:

- Frontend: http://localhost:5173
- API: http://localhost:3000
- Health check: http://localhost:3000/health

Para acompanhar os logs ou encerrar a aplicação:

```bash
docker compose logs -f
docker compose down
```

Os dados do PostgreSQL são preservados no volume `postgres_data`. Para também apagar os dados:

```bash
docker compose down -v
```

As portas padrão podem ser personalizadas copiando [`.env.example`](./.env.example) para `.env`. Se a porta do backend mudar, ajuste também `VITE_API_URL` antes de construir novamente o frontend.

## Executar localmente

### Pré-requisitos

- Node.js 24 e npm.
- Docker com Docker Compose para o PostgreSQL.

Inicie apenas o banco:

```bash
docker compose up -d database
```

Em um terminal, prepare e execute o backend:

```bash
cd backend
cp .env.example .env
npm ci
npx prisma migrate deploy
npm run dev
```

Em outro terminal, prepare e execute o frontend:

```bash
cd frontend
cp .env.example .env
npm ci
npm run dev
```

Abra http://localhost:5173.

## Como usar

1. Crie pelo menos uma conta corrente ou poupança.
2. Selecione uma conta e faça um saque.
3. Crie uma segunda conta para realizar transferências.
4. Confira a tarifa informada e os saldos atualizados na tela.

### Regras financeiras

- **Conta corrente:** cobra R$ 1,00 por saque ou transferência e permite saldo até `-500.00`.
- **Conta poupança:** não cobra tarifa e nunca permite saldo negativo.
- Os valores são recebidos e retornados pela API como strings decimais, por exemplo `"100.50"`, e armazenados internamente como centavos inteiros.
- Em uma transferência, débito e crédito pertencem à mesma transação de banco. Uma falha provoca rollback de toda a operação.

## API

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Verifica a disponibilidade da API. |
| `POST` | `/accounts` | Cria uma conta. |
| `GET` | `/accounts` | Lista as contas. |
| `POST` | `/accounts/:id/withdrawals` | Realiza um saque. |
| `POST` | `/transfers` | Transfere entre duas contas. |

Exemplo de criação de conta:

```json
{
  "name": "Conta principal",
  "type": "CHECKING",
  "initialBalance": "100.00"
}
```

Exemplo de transferência:

```json
{
  "sourceAccountId": "uuid-da-conta-de-origem",
  "destinationAccountId": "uuid-da-conta-de-destino",
  "amount": "50.00"
}
```

## Arquitetura

```text
Routes → Controllers → Services → Repository → Prisma/PostgreSQL
                                  ↘ TransactionManager
```

- Zod valida os dados HTTP antes dos Controllers.
- Controllers adaptam HTTP e não contêm regras financeiras.
- Services concentram as regras de negócio.
- Services dependem de interfaces, permitindo testes com persistência em memória.
- O `TransactionManager` Prisma usa isolamento serializável e repetição em conflitos de escrita.

## Validação do projeto

Backend:

```bash
cd backend
npm ci
npm run typecheck
npm test
npm run build
```

Frontend:

```bash
cd frontend
npm ci
npm run lint
npm run build
```

Os testes cobrem tarifas, limites exatos, saldos insuficientes, validação HTTP, persistência dos novos saldos e rollback de transferência.
