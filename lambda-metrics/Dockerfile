FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY index.js server.js ./
EXPOSE 8082
ENV PORT=8082
CMD ["node", "server.js"]
