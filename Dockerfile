#BUILDER
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /pardo

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY prisma ./prisma
RUN pnpm prisma generate

COPY . .
RUN pnpm run build

#RUNNER - STAGE 02
FROM node:24-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /pardo

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

COPY --from=builder /pardo/dist ./dist
COPY --from=builder /pardo/prisma ./prisma
COPY --from=builder /pardo/src/generated ./src/generated

EXPOSE 3000
CMD [ "./entrypoint.sh" ]