# Minha Solução — Banco Agilize

## Stack

- **Backend:** Node.js 24 com TypeScript, Express, Zod, Prisma e PostgreSQL.
- **Frontend:** React 19 com TypeScript e Vite.

## Execução

Com Git e Docker instalados:

```bash
git clone https://github.com/joaovitordourado1/desafio-est-gio.git
cd desafio-est-gio
docker compose up --build -d
```

- Frontend: http://localhost:5173
- API: http://localhost:3000
- Health check: http://localhost:3000/health

O primeiro uso, os comandos para desenvolvimento local, os testes e as decisões de arquitetura estão documentados no [README](./README.md).
