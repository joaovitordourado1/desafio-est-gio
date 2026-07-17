# Contexto do Projeto: Desafio Técnico - Banco Agilize

## Objetivo
Desenvolver a API (Backend) de um banco simulado, suportando operações de Saque e Transferência entre dois tipos diferentes de contas (Corrente e Poupança).

## Stack Tecnológica Base
- **Linguagem:** TypeScript (Node.js)
- **Framework Web:** Express
- **Validação de Dados:** Zod
- **ORM:** Prisma ORM
- **Banco de Dados:** PostgreSQL 18
- **Infraestrutura:** Docker e Docker Compose (Obrigatório para a execução do projeto)

## 1. Tipos de Conta e Suas Propriedades
O sistema possui dois tipos de conta com regras estritas[cite: 1]:

### Conta Corrente[cite: 1]
- **Tarifa por saque/transferência:** R$ 1,00 por operação[cite: 1].
- **Saldo negativo (Cheque Especial):** Permitido até o limite máximo de R$ 500,00 negativos[cite: 1]. O valor da operação somado à tarifa não pode ultrapassar este limite[cite: 1].

### Conta Poupança[cite: 1]
- **Tarifa por saque/transferência:** Isento (R$ 0,00)[cite: 1].
- **Saldo negativo:** Não permitido em nenhuma hipótese[cite: 1]. O saldo mínimo após qualquer operação deve ser R$ 0,00[cite: 1].

## 2. Operações Suportadas
As validações matemáticas e financeiras devem ocorrer na camada de **Service**.

- **Saque (Obrigatório)[cite: 1]:** Retira um valor de uma única conta especificada[cite: 1].
- **Transferência (Diferencial)[cite: 1]:** Move o valor de uma conta (origem) para outra (destino)[cite: 1].
  - *Restrição Técnica:* Transferências exigem **Database Transactions**. Se o crédito na conta de destino falhar, o débito na conta de origem deve sofrer *rollback*.

## 3. Regras de Negócio Críticas (R1 e R2)
- **R1:** Para operações em Conta Corrente, o sistema deve deduzir o valor solicitado + R$ 1,00 de tarifa do saldo[cite: 1]. Se o saldo resultante for menor que -500.00, a transação deve ser bloqueada[cite: 1].
- **R2:** Para operações em Conta Poupança, o sistema deve deduzir apenas o valor solicitado[cite: 1]. Se o saldo resultante for menor que 0.00, a transação deve ser bloqueada[cite: 1].

## 4. Padrões de Código Exigidos
- Utilizar Zod para validar rigorosamente o corpo (body) de todas as requisições HTTP antes de acionar os serviços.
- Não misturar regras de negócio dentro dos Controllers. O Controller apenas recebe a requisição, chama o Service e retorna o status HTTP adequado.
- Utilizar tratamento de erros global ou blocos try/catch claros, retornando códigos HTTP padronizados (ex: 400 Bad Request para validação de saldo, 404 Not Found para contas inexistentes).
