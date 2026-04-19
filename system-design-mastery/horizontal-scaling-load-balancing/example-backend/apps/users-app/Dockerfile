# Dockerfile isolate cho users-app — build context = monorepo root (example-backend/)
# (EN: isolated Dockerfile — build context must be the monorepo root)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY libs ./libs
COPY apps/users-app ./apps/users-app
RUN npx nest build users-app

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY --from=builder /app/dist/apps/users-app ./dist
ENV PORT=3001
EXPOSE 3001
CMD ["node", "dist/main.js"]
