# 1. Usa Node.js oficial
FROM node:18-bullseye

# 2. Instala FFmpeg
RUN apt-get update && apt-get install -y ffmpeg git

# 3. Copia el código y dependencias
WORKDIR /app
COPY package*.json ./
RUN npm install

# 4. Copia el resto del código
COPY . .

# 6. Expone el puerto
EXPOSE 4000

# 7. Variables de entorno ejemplo
ENV PORT=4000
ENV SUPABASE_URL=""
ENV SUPABASE_SERVICE_KEY=""
ENV UPLOAD_API_KEY=""

# 8. Comando de inicio
CMD ["node", "index.js"]
