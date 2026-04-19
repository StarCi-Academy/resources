# Dockerfile isolate cho sqlite-app
# (EN: isolated Dockerfile for sqlite-app)
#
# Build context = monorepo root (example-backend/). Xem docker-compose.yaml cạnh file.
# (EN: Build context = monorepo root (example-backend/). See adjacent docker-compose.yaml.)

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
# sqlite3 có prebuilt binary cho node-alpine → không cần toolchain
# (EN: sqlite3 ships prebuilt binaries for node-alpine → no build toolchain needed)
RUN npm install
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY libs ./libs
COPY apps/sqlite-app ./apps/sqlite-app
# Chỉ build đúng app này (EN: build only this app)
RUN npx nest build sqlite-app

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY --from=builder /app/dist/apps/sqlite-app ./dist

ENV PORT=3000
ENV SQLITE_PATH=/data/notes.db
EXPOSE 3000

CMD ["node", "dist/main.js"]
