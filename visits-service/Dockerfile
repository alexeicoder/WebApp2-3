FROM node:18-bullseye AS builder

# Установка зависимостей времени
RUN apt-get update && \
    apt-get install -y --no-install-recommends tzdata && \
    ln -fs /usr/share/zoneinfo/Europe/Moscow /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install @nestjs/typeorm@11.0.0 --legacy-peer-deps
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:18-bullseye-slim

# Настройка времени в финальном образе
RUN apt-get update && \
    apt-get install -y --no-install-recommends tzdata && \
    ln -fs /usr/share/zoneinfo/Europe/Moscow /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
ENV PORT=3001
EXPOSE 3001
CMD ["node", "--experimental-global-webcrypto", "dist/main.js"]