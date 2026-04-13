# Environment Setup & NestJS Core — Dependency Injection Demo

A hands-on demonstration of **NestJS Dependency Injection** and the **Module System**, using two feature modules: `CatModule` and `DogModule`.

---

## What this project demonstrates

| Concept | Where to look |
|---|---|
| Nested DI chain (3 levels) | `src/modules/cat/` |
| Encapsulation via `exports` | `cat.module.ts` |
| Cross-module injection | `dog.service.ts` → injects `CatService` |
| IoC singleton reuse | `CatFoodService` shared across `CatService` & `CatHealthService` |
| `@Global()` module pattern | Documented in comments |

---

## Folder structure

```
src/
├── modules/
│   ├── cat/
│   │   ├── cat-food.service.ts    ← Level 1: no dependencies
│   │   ├── cat-health.service.ts  ← Level 2: injects CatFoodService
│   │   ├── cat.service.ts         ← Level 3: injects CatFoodService + CatHealthService
│   │   ├── cat.controller.ts
│   │   └── cat.module.ts          ← exports only CatService (encapsulation!)
│   └── dog/
│       ├── dog.service.ts         ← injects CatService from CatModule
│       ├── dog.controller.ts
│       └── dog.module.ts          ← imports CatModule to unlock CatService
├── app.module.ts                  ← root module, imports CatModule + DogModule
└── main.ts
```

---

## The Dependency Graph

NestJS IoC Container resolves the **entire graph automatically** — no `new` keyword anywhere.

```
AppModule
├── CatModule
│   └── CatController
│         └── CatService
│               ├── CatFoodService        ← singleton #1
│               └── CatHealthService
│                     └── CatFoodService  ← same singleton #1 reused!
└── DogModule
      imports: [CatModule]
      └── DogController
            └── DogService
                  └── CatService          ← cross-module injection
```

> **Key insight:** `CatFoodService` is registered once as a singleton. Even though both `CatService` and `CatHealthService` depend on it, the IoC Container injects the **same instance** into both — efficiently managed in RAM.

---

## API Endpoints

### Cat endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/cats` | Cat self-introduction |
| GET | `/cats/status` | Full health report (exercises all 3 DI levels) |
| GET | `/cats/feed/:food` | Feed the cat a specific food |

```bash
curl http://localhost:3000/cats
curl http://localhost:3000/cats/status
curl http://localhost:3000/cats/feed/tuna
curl http://localhost:3000/cats/feed/pizza   # ❌ not on menu
```

### Dog endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/dogs` | Dog self-introduction |
| GET | `/dogs/spy` | Dog spies on cat via cross-module CatService |
| GET | `/dogs/steal/:food` | Dog tries to steal cat's food |

```bash
curl http://localhost:3000/dogs
curl http://localhost:3000/dogs/spy
curl http://localhost:3000/dogs/steal/salmon
```

---

## Running the project

```bash
# Install dependencies
npm install

# Development (watch mode)
npm run start:dev

# Production
npm run start:prod
```

---

## Key DI concepts explained

### 1. `@Injectable()` — registering with the IoC Container

```typescript
@Injectable()
export class CatFoodService {
  getMenu(): string[] { ... }
}
```

Decorating a class with `@Injectable()` hands its lifecycle to NestJS. You never call `new CatFoodService()` — the Container does it for you.

### 2. Constructor injection

```typescript
@Injectable()
export class CatHealthService {
  constructor(private readonly catFoodService: CatFoodService) {}
  //           ↑ NestJS reads the TypeScript metadata and injects automatically
}
```

### 3. Encapsulation — private vs exported providers

By default, all providers inside a module are **private**. Only explicitly exported providers are accessible to other modules.

```typescript
// cat.module.ts
@Module({
  providers: [CatFoodService, CatHealthService, CatService],
  exports: [CatService],  // CatFoodService & CatHealthService stay private!
})
export class CatModule {}
```

### 4. Cross-module injection

To use `CatService` inside `DogModule`, you must import `CatModule`:

```typescript
// dog.module.ts
@Module({
  imports: [CatModule],  // ← unlocks all of CatModule's exports
  providers: [DogService],
})
export class DogModule {}
```

Forgetting this import causes a runtime error:
```
Nest can't resolve dependencies of the DogService (?).
Please make sure that the argument CatService is
available in the DogModule context.
```

### 5. Global modules

For utility services used everywhere (e.g., `DatabaseService`, `ConfigService`), you can skip importing their module every time:

```typescript
@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
```

> ⚠️ Use `@Global()` sparingly — it hides dependencies and makes modules harder to reason about in isolation.

---

## References

- [NestJS First Steps](https://docs.nestjs.com/first-steps)
- [Providers in NestJS](https://docs.nestjs.com/providers)
- [Modules in NestJS](https://docs.nestjs.com/modules)
