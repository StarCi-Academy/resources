# Dockerfile isolate cho sqlite-app
# (EN: isolated Dockerfile for sqlite-app)
#
# Build context = monorepo root (example-backend/). Xem docker-compose.yaml cạnh file.
# (EN: Build context = monorepo root (example-backend/). See adjacent docker-compose.yaml.)

# stage 1: base & deps
FROM node:20-alpine AS base
WORKDIR /app

# Chỉ copy lockfile + package manifest để tận dụng layer cache hiệu quả.
# (EN: Copy only lockfile + package manifest to maximize layer cache reuse.)
COPY package.json package-lock.json ./
RUN npm ci

# stage 2: builder
FROM base AS builder
# Copy cấu hình build chung của NestJS monorepo.
# (EN: Copy shared NestJS monorepo build configuration.)
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
# Copy shared libs vì app phụ thuộc vào code dùng chung.
# (EN: Copy shared libs because the app depends on shared code.)
COPY libs ./libs
# Copy source riêng của sqlite-app để build isolate đúng phạm vi.
# (EN: Copy sqlite-app specific source to keep build scope isolated.)
COPY apps/sqlite-app ./apps/sqlite-app
# Build duy nhất sqlite-app để giảm thời gian build và kích thước artifact.
# (EN: Build only sqlite-app to reduce build time and artifact size.)
RUN npx nest build sqlite-app


# stage 3: runtime
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Cài đặt production dependencies bằng lockfile để đảm bảo deterministic.
# (EN: Install production dependencies from lockfile for deterministic builds.)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
# Copy artifact đã build từ builder stage.
# (EN: Copy built artifact from the builder stage.)
COPY --from=builder /app/dist/apps/sqlite-app ./dist

ENV PORT=3000
ENV SQLITE_PATH=/data/notes.db
EXPOSE 3000

# Chạy bằng user non-root để giảm rủi ro bảo mật runtime.
# (EN: Run as a non-root user to reduce runtime security risk.)
RUN mkdir -p /data && chown -R node:node /data
USER node
CMD ["node", "dist/apps/sqlite-app/src/main.js"]
