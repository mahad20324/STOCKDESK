FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN apk add --no-cache python3 make g++ libusb-dev && npm install --omit=dev

COPY . .

CMD ["node", "src/server.js"]
