FROM node:20

# Instala FFmpeg, git y dependencias para Puppeteer/Chromium
RUN apt-get update && apt-get install -y \
    ffmpeg git \
    ca-certificates fonts-liberation libappindicator3-1 libasound2 \
    libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 \
    libdrm2 libgbm1 libgtk-3-0 libnspr4 libnss3 libx11-xcb1 \
    libxcomposite1 libxdamage1 libxrandr2 xdg-utils wget \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# (Opcional) No borres package-lock.json antes de instalar
RUN npm install

COPY . .

EXPOSE 4000

ENV PORT=4000

CMD ["node", "index.js"]
