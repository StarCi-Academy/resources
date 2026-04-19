# Dockerfile isolate cho products-app — build context = monorepo root
# (EN: isolated Dockerfile — build context must be the monorepo root)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY libs ./libs
COPY apps/products-app ./apps/products-app
RUN npx nest build products-app

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY --from=builder /app/dist/apps/products-app ./dist
ENV PORT=3003
EXPOSE 3003
CMD ["node", "dist/main.js"]
