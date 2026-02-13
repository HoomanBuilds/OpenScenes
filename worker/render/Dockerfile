FROM node:20-bookworm
RUN apt-get update && apt-get install -y chromium
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY app ./app/
COPY worker/ ./worker/
COPY remotion/ ./remotion/
COPY lib/ ./lib/

CMD ["npx", "tsx", "worker/render/index.ts"]
