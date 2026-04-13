# Environment Setup & NestJS Core — Dependency Injection Demo
# (EN: Environment Setup & NestJS Core — Dependency Injection Demo)

Minh họa thực tế về **NestJS Dependency Injection** và **Hệ thống Module**, sử dụng chuỗi logic giữa hai modules: `CatModule` và `DogModule`.
(EN: A hands-on demonstration of **NestJS Dependency Injection** and the **Module System**, through the logic flow between `CatModule` and `DogModule`.)

---

## 🛠️ 1. Thiết lập & Chạy (Setup & Run)

### 1.1 Cài đặt dependencies (EN: Install dependencies)
```bash
npm install
```

### 1.2 Chạy ứng dụng (EN: Run application)
```bash
# Development mode
npm run start:dev
```

---

## 🏗️ 2. Những khái niệm cốt lõi (Core Concepts Demonstrated)

| Khái niệm (Concept) | Vị trí (Location) | Diễn giải (Explanation) |
|---|---|---|
| **Nested DI chain** | `src/modules/cat/` | Chuỗi DI 3 cấp: Service A → Service B → Service C. |
| **Encapsulation** | `cat.module.ts` | Chỉ export `CatService`, giữ các sub-services khác ở chế độ private. |
| **Cross-module DI** | `dog.service.ts` | `DogService` inject `CatService` từ module khác. |
| **Singleton Reuse** | `CatFoodService` | Một instance duy nhất được dùng chung bởi nhiều service khác nhau. |

---

## 🔄 3. Luồng hệ thống (System Flow)

Sơ đồ Dependency Graph được NestJS IoC Container tự động khởi tạo:
(EN: Dependency Graph automatically initialized by NestJS IoC Container:)

```
AppModule (Root)
├── CatModule
│   ├── CatController
│   └── CatService
│         ├── CatFoodService (Singleton #1)
│         └── CatHealthService
│               └── CatFoodService (Reused Singleton #1)
└── DogModule
      imports: [CatModule]
      └── DogController
            └── DogService
                  └── CatService (Cross-module Injection)
```

> **Key insight:** NestJS quản lý các service dưới dạng **Singleton** mặc định. Dù `CatService` và `CatHealthService` đều cần `CatFoodService`, IoC Container chỉ tạo 1 instance duy nhất và inject vào cả hai nơi, giúp tiết kiệm bộ nhớ RAM.
> (EN: NestJS manages services as **Singletons** by default. Even though multiple services depend on `CatFoodService`, the IoC Container creates only one instance and injects it into both, saving memory.)

---

## 📡 4. API Endpoints

### 4.1 Cat Domain
- `GET /cats`: Mèo tự giới thiệu.
- `GET /cats/status`: Báo cáo sức khỏe (kích hoạt toàn bộ 3 cấp DI).
- `GET /cats/feed/:food`: Cho mèo ăn (check menu từ `CatFoodService`).

### 4.2 Dog Domain
- `GET /dogs/spy`: Chó "theo dõi" mèo bằng cách gọi `CatService` từ module của mèo.
- `GET /dogs/steal/:food`: Chó cố gắng ăn trộm thức ăn của mèo.

---

## 📖 5. Giải thích kỹ thuật (Technical Breakdown)

### 5.1 `@Injectable()` — Đăng ký với IoC Container
Mọi class được đánh dấu `@Injectable()` sẽ được NestJS quản lý vòng đời. Bạn không bao giờ gọi `new Service()` theo cách thủ công.
(EN: Any class marked with `@Injectable()` is lifecycle-managed by NestJS. You never manually call `new Service()`.)

### 5.2 Constructor Injection
NestJS đọc TypeScript metadata để biết service nào cần được inject vào constructor:
(EN: NestJS reads TypeScript metadata to know which service should be injected into the constructor:)
```ts
constructor(private readonly catService: CatService) {}
```

### 5.3 Đóng gói Module (Encapsulation)
Mặc định, mọi service trong module đều là **private**. Để module khác có thể sử dụng, bạn PHẢI export nó trong module source.
(EN: By default, all services in a module are **private**. To let other modules use them, you MUST export them in the source module.)

---

## 📚 6. Tài liệu tham khảo (References)

- [NestJS Dependency Injection](https://docs.nestjs.com/providers)
- [NestJS Modules System](https://docs.nestjs.com/modules)
