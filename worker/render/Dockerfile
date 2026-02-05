FROM node:20-bookworm

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY worker/ ./worker/
COPY remotion/ ./remotion/
COPY lib/ ./lib/

CMD ["npx", "tsx", "worker/render/index.ts"]
