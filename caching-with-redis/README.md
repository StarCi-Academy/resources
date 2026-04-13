# Caching with Redis: The 3-Layer Demo

Dự án minh họa 3 phương pháp caching thực tế trong NestJS, tương ứng với 3 tầng của kiến trúc ứng dụng.

---

## 🛠️ Thiết lập (Setup)

### 1. Khởi chạy Infra (Docker) (EN: Run Infra)
```bash
docker compose -f .docker/postgresql.yaml up -d
docker compose -f .docker/redis.yaml up -d
```

### 2. Chạy ứng dụng (EN: Run application)
```bash
npm install --legacy-peer-deps
npm run start:dev
```

---

## 🏗️ 3 Tầng Caching (The 3 Layers)

Dự án được thiết kế để bạn có thể quan sát cache flow thông qua 3 endpoints chuyên biệt:

### 1. Tầng Tiếp nhận (Response Layer)
- **Endpoint:** `GET /cats/response-layer`
- **Cơ chế:** Dùng `CacheInterceptor` để cache toàn bộ HTTP Response.
- **Tác dụng:** Trả kết quả cực nhanh ngay từ entry point. Service layer sẽ không được gọi nếu cache hit.

### 2. Tầng Nghiệp vụ (Logic Layer)
- **Endpoint:** `GET /cats/logic-layer`
- **Cơ chế:** Inject `CACHE_MANAGER` vào Service và tự viết code logic để `get()`/`set()`.
- **Tác dụng:** Cache kết quả của các logic nặng (ví dụ: tính toán stats, gọi 3rd party API) mà không làm ảnh hưởng đến toàn bộ response.

### 3. Tầng Dữ liệu (DB Query Layer)
- **Endpoint:** `GET /cats/db-layer`
- **Cơ chế:** TypeORM built-in cache.
- **Tác dụng:** Cache kết quả của câu lệnh SQL. Database PostgreSQL sẽ không cần thực thi lại cùng một query trong thời gian ngắn.

---

## 🔄 Cấu hình Multi-tier (Keyv)

Cả **Logic Layer** và **Response Layer** đều được vận hành bởi hệ thống cache đa tầng trong `AppModule`:
1. **Redis Store (Global):** Đồng bộ dữ liệu tập trung.
2. **Buffer Memory (Local):** RAM cục bộ cho tốc độ truy xuất siêu tốc (~0ms).

---

## 📡 Kiểm tra kết quả (How to Test)

Quan sát log trong Terminal để thấy sự khác biệt:
- **Response Layer hit:** Không thấy log nào từ Controller/Service.
- **Logic Layer hit:** Thấy log từ Controller, nhưng Service báo `Logic Cache Hit`.
- **DB Layer hit:** Thấy log từ Controller/Service, nhưng không có lệnh SQL được execute thực sự trong DB log (hoặc tốc độ trả về cực nhanh).

---

## 📚 Tài liệu tham khảo (References)

- [NestJS Cache Manager](https://docs.nestjs.com/techniques/caching)
- [TypeORM Query Caching](https://typeorm.io/caching)
