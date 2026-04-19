# Dockerfile isolate cho postgres-app
# (EN: isolated Dockerfile for postgres-app)
#
# Build context phải là ROOT của monorepo (example-backend/) để copy được
# libs/ + apps/postgres-app/ + config chung. Xem docker-compose.yaml cạnh file.
# (EN: Build context MUST be the monorepo root (example-backend/) so we can
#  copy libs/ + apps/postgres-app/ + shared config. See the adjacent docker-compose.yaml.)

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY libs ./libs
COPY apps/postgres-app ./apps/postgres-app
# Chỉ build đúng app này → image isolate, nhỏ hơn (EN: build only this app for a smaller isolated image)
RUN npx nest build postgres-app

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
# pg là pure JS → không cần build toolchain (EN: pg is pure JS, no toolchain needed)
RUN npm install --omit=dev --ignore-scripts
COPY --from=builder /app/dist/apps/postgres-app ./dist

ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/main.js"]
