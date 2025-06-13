# 1. Usa Node.js oficial
FROM node:20
# 2. Instala FFmpeg
RUN apt-get update && apt-get install -y ffmpeg git

# 3. Copia el código y dependencias
WORKDIR /app
COPY package*.json ./
RUN rm -rf node_modules package-lock.json
npm install
RUN npm install || (cat /root/.npm/_logs/*-debug-0.log && false)
# 4. Copia el resto del código
COPY . .

# 6. Expone el puerto
EXPOSE 4000

# 7. Variables de entorno ejemplo
ENV PORT=4000

# 8. Comando de inicio
CMD ["node", "index.js"]
