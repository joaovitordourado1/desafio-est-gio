FROM node:24-alpine

WORKDIR /app

ENV DATABASE_URL=postgresql://agilize:agilize@database:5432/banco_agilize?schema=public

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
