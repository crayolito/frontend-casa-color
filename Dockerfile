# syntax=docker/dockerfile:1.7

# =============================================================================
# Stage 1 — builder: instala y compila Angular a estáticos
# =============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

# Build de producción. Usa el file replacement de angular.json
# (environment.ts -> environment.prod.ts).
RUN npm run build

# =============================================================================
# Stage 2 — runtime: nginx sirve los estáticos, imagen final mínima
# =============================================================================
FROM nginx:1.27-alpine AS runtime

# Copia config custom de nginx (SPA fallback, gzip, cache headers).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia los estáticos desde dist/frontend/browser (salida del builder).
# Si cambiás el "name" del proyecto en angular.json, ajustá el path.
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

# nginx ya maneja señales correctamente, no hace falta dumb-init.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost/ || exit 1
