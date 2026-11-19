# ==========================================
# ETAPA 1: Construcción del Frontend (Builder)
# ==========================================
FROM node:24-bookworm-slim AS builder

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente y compilar bundle de producción
COPY . .
RUN npm run build

# ==========================================
# ETAPA 2: Servidor Nginx de Producción
# ==========================================
FROM nginx:alpine AS runner

# Copiar configuración optimizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los artefactos estáticos compilados desde la etapa builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
