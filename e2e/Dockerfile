FROM mcr.microsoft.com/playwright:v1.50.1-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN apt-get update && apt-get install -y netcat-openbsd

RUN chmod +x ./entrypoint.sh ./wait-for.sh

CMD ["./entrypoint.sh"]
