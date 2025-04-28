FROM node:18-bullseye AS builder

# Установка зависимостей времени и компиляторов
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    tzdata \
    && ln -fs /usr/share/zoneinfo/Europe/Moscow /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем Python 3 как версию по умолчанию
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3 1

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm_config_python=python3 npm install --no-optional && \
    npm rebuild bcrypt --update-binary --build-from-source
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
RUN chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]