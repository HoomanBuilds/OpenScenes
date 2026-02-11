FROM node:20-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci 

COPY . .

CMD ["npm", "run", "worker:ai"]
