FROM mcr.microsoft.com/playwright:v1.54.1-jammy

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm ci

CMD ["npx", "playwright", "test"]