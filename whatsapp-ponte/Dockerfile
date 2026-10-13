FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund
COPY ponte.mjs ./
# A sessão do WhatsApp fica no volume: sem ele, cada reinício pede QR de novo.
RUN mkdir -p /app/.data
VOLUME ["/app/.data"]
EXPOSE 3100
CMD ["node", "ponte.mjs"]
