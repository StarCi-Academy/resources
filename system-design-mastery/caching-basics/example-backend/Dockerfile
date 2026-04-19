# Dockerfile cho cache-app — NestJS single-app build
# (EN: Dockerfile for cache-app — NestJS single-app build)
#
# Run command:
# docker compose -f docker-compose.yaml up --build -d

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
# Build NestJS ra dist/ (EN: build NestJS into dist/)
RUN npx nest build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
# pg + cache-manager-redis-yet đều là pure JS → không cần toolchain
# (EN: pg + redis-yet are pure JS → no build toolchain needed)
RUN npm install --omit=dev --ignore-scripts
COPY --from=builder /app/dist ./dist

ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/main.js"]
