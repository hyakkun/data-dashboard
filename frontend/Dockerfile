# Builder Stage
FROM node:20-slim AS builder
WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

COPY package*.json ./
RUN npm ci --include=dev

COPY . .

RUN npm run build

RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# Runner Stage
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

RUN useradd -m nextjs && chown -R nextjs:nextjs /app
USER nextjs

EXPOSE 3000
CMD ["npm", "run", "start"]