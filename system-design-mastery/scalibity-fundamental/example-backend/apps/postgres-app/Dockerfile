# Dockerfile isolate cho postgres-app
# (EN: isolated Dockerfile for postgres-app)
#
# Build context phải là ROOT của monorepo (example-backend/) để copy được
# libs/ + apps/postgres-app/ + config chung. Xem docker-compose.yaml cạnh file.
# (EN: Build context MUST be the monorepo root (example-backend/) so we can
# copy libs/ + apps/postgres-app/ + shared config. See the adjacent docker-compose.yaml.)

# stage 1: base & deps
FROM node:20-alpine AS base
WORKDIR /app

# Chỉ copy package manifest + lockfile để tối ưu cache dependency layer.
# (EN: Copy only package manifest + lockfile to optimize dependency layer caching.)
COPY package.json package-lock.json ./
RUN npm ci

# stage 2: builder
FROM base AS builder
# Copy cấu hình build của NestJS monorepo dùng chung.
# (EN: Copy shared NestJS monorepo build configuration.)
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
# Copy shared libs để đảm bảo resolve đúng imports nội bộ.
# (EN: Copy shared libs to ensure internal imports resolve correctly.)
COPY libs ./libs
# Copy source của postgres-app để build tách biệt theo service.
# (EN: Copy postgres-app source to build in a service-isolated manner.)
COPY apps/postgres-app ./apps/postgres-app
# Build duy nhất postgres-app để artifact nhỏ gọn và rõ trách nhiệm.
# (EN: Build only postgres-app for a lean artifact and clear responsibility.)
RUN npx nest build postgres-app

# stage 3: runtime
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Cài production dependencies bằng npm ci để đồng bộ tuyệt đối theo lockfile.
# (EN: Install production dependencies with npm ci for exact lockfile parity.)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
# Copy artifact đã build từ stage trước.
# (EN: Copy the built artifact from the previous stage.)
# QUAN TRỌNG: Copy TOÀN BỘ folder dist để giữ lại các compiled libs
COPY --from=builder /app/dist/apps/postgres-app ./dist

ENV PORT=3000
EXPOSE 3000

# Chạy bằng non-root user để tăng độ an toàn runtime.
# (EN: Run as a non-root user to improve runtime safety.)
USER node
CMD ["node", "dist/apps/postgres-app/src/main.js"]
