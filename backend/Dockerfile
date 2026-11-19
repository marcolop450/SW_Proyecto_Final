# ==========================================
# ETAPA 1: Construcción y Compilación (Builder)
# ==========================================
FROM node:24-bookworm-slim AS builder

WORKDIR /app

# Instalar dependencias del sistema requeridas para Prisma y compilación
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Copiar manifiestos y esquema de base de datos
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias completas y generar cliente Prisma
RUN npm ci
RUN npx prisma generate

# Copiar código fuente y compilar
COPY . .
RUN npm run build

# Purgar dependencias de desarrollo conservando cliente Prisma generado
RUN npm prune --omit=dev

# ==========================================
# ETAPA 2: Entorno de Ejecución (Runner)
# ==========================================
FROM node:24-bookworm-slim AS runner

WORKDIR /app

# Dependencias mínimas de sistema para producción
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl dumb-init \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000

# Usuario no root por seguridad
USER node

# Copiar únicamente artefactos necesarios de la etapa anterior
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
