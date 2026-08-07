# syntax=docker/dockerfile:1

# --- deps: instala dependências (cache separado do código) ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# --- builder: compila a aplicação Next.js ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Variáveis dummy só para o build conseguir rodar (não conectam de verdade).
# Os valores reais entram em runtime via docker-compose / .env.
ENV MONGODB_URI="mongodb://placeholder:27017/placeholder"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- runner: imagem final, enxuta, só com o necessário para rodar ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Saída "standalone" do Next.js: já vem com um server.js minimalista
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
