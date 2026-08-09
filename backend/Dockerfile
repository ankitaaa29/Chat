FROM node:20-alpine

WORKDIR /app

# Install openssl for Prisma binary compatibility
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma Client
RUN npx prisma generate

COPY . .

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss --force-reset && npm start"]
