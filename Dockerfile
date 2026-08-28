# --- ETAPA 1: Compilación con Node.js ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos e instalar dependencias
COPY package*.json ./
RUN npm ci || npm install

# Copiar código fuente y compilar bundle estático Vite
COPY . .
RUN npm run build

# --- ETAPA 2: Servidor Web Nginx ultra-ligero y rápido ---
FROM nginx:alpine AS runner

# Copiar archivos compilados a la carpeta pública de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx para SPA (Single Page Application)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 3000

CMD ["nginx", "-g", "daemon off;"]
