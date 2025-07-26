FROM mcr.microsoft.com/playwright:v1.50.1-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Ajout d'un script d'attente
COPY wait-for.sh /usr/local/bin/wait-for
RUN chmod +x /usr/local/bin/wait-for

CMD ["./entrypoint.sh"]
