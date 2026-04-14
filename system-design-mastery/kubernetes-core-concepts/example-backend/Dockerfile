# ---- Stage 1: Build ----
# Dùng Node.js Alpine để build — nhẹ và nhanh (EN: use Node.js Alpine for building — lightweight and fast)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy file quản lý dependency trước để tận dụng Docker layer cache (EN: copy dependency files first to leverage Docker layer cache)
COPY package*.json ./

# Cài đặt toàn bộ dependency (bao gồm devDeps để build) (EN: install all dependencies including devDeps for building)
RUN npm ci

# Copy toàn bộ source code vào container (EN: copy all source code into the container)
COPY . .

# Build ứng dụng NestJS ra thư mục dist (EN: build the NestJS app to dist folder)
RUN npm run build

# ---- Stage 2: Production ----
# Dùng image nhẹ cho production — không cần devDeps (EN: use lightweight image for production — no devDeps needed)
FROM node:20-alpine

WORKDIR /app

# Chỉ copy file dependency và cài production-only (EN: copy dependency files and install production-only)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy artifact đã build từ stage trước (EN: copy built artifacts from the builder stage)
COPY --from=builder /app/dist ./dist

# Expose cổng 3000 cho container (EN: expose port 3000 for the container)
EXPOSE 3000

# Chạy ứng dụng production (EN: run the production application)
CMD ["node", "dist/main.js"]
