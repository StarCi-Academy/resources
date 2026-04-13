import { Module } from '@nestjs/common';
import { DogController } from './dog.controller';
import { DogService } from './dog.service';
import { CatModule } from '../cat/cat.module';

/**
 * DogModule — Bounded context cho toàn bộ domain Dog.
 * Import CatModule để mở khóa CatService cho DogService inject.
 * (EN: Bounded context for the entire Dog domain.
 * Imports CatModule to unlock CatService for injection into DogService.)
 *
 * Tại sao phải import CatModule?
 *   NestJS scope providers theo từng module — provider từ module khác KHÔNG tự động available.
 *   Phải import module chứa provider đó, và module đó phải export provider.
 *   Nếu thiếu import này, NestJS ném lỗi runtime:
 *     "Nest can't resolve dependencies of the DogService (?).
 *      Please make sure that CatService is available in the DogModule context."
 * (EN: Why must we import CatModule?
 *   NestJS scopes providers per module — providers from other modules are NOT automatically available.
 *   You must import the module containing the provider, and that module must export it.
 *   Without this import, NestJS throws a runtime error:
 *     "Nest can't resolve dependencies of the DogService (?).
 *      Please make sure that CatService is available in the DogModule context.")
 */
@Module({
  // Import CatModule để DogService có thể inject CatService qua cross-module DI
  // (EN: Import CatModule so DogService can inject CatService via cross-module DI)
  imports: [CatModule],

  // Đăng ký controller nhận HTTP request cho domain Dog
  // (EN: Register controller to accept HTTP requests for the Dog domain)
  controllers: [DogController],

  // Đăng ký DogService vào IoC Container — nó sẽ được inject CatService tự động
  // (EN: Register DogService into the IoC Container — it will be auto-injected with CatService)
  providers: [DogService],
})
export class DogModule {}
