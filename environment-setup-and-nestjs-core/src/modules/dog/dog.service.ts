import { Injectable, Logger } from '@nestjs/common';
import { CatService } from '../cat/cat.service';

/**
 * DogService — Minh họa cross-module Dependency Injection trong NestJS.
 * Inject CatService từ CatModule — DogModule phải khai báo `imports: [CatModule]` mới dùng được.
 * (EN: Demonstrates cross-module Dependency Injection in NestJS.
 * Injects CatService from CatModule — DogModule must declare `imports: [CatModule]` to enable this.)
 *
 * Nếu thiếu `imports: [CatModule]` trong DogModule, NestJS sẽ ném lỗi runtime:
 *   "Nest can't resolve dependencies of the DogService (?).
 *    Please make sure that CatService is available in the DogModule context."
 * (EN: Without `imports: [CatModule]` in DogModule, NestJS throws a runtime error:
 *   "Nest can't resolve dependencies of the DogService (?).")
 *
 * @side-effects Ghi log khi spy hoặc thách thức mèo (EN: logs when spying on or challenging the cat)
 */
@Injectable()
export class DogService {
  private readonly logger = new Logger(DogService.name);

  constructor(
    // Cross-module injection: CatService đến từ CatModule thông qua exports
    // Nếu CatModule không export CatService, inject này sẽ thất bại
    // (EN: Cross-module injection: CatService comes from CatModule via exports.
    // If CatModule does not export CatService, this injection will fail.)
    private readonly catService: CatService,
  ) {}

  /**
   * Trả về lời giới thiệu của chó.
   * (EN: Returns the dog's self-introduction.)
   *
   * @returns string — Chuỗi giới thiệu (EN: introduction string)
   */
  introduce(): string {
    return '🐶 Woof! I am a Dog. I also live inside the NestJS IoC Container.';
  }

  /**
   * Chó "nghe lén" mèo bằng cách gọi CatService từ CatModule.
   * Minh họa cách các module cộng tác qua exports/imports tường minh.
   * (EN: Dog "spies" on the cat by calling CatService from CatModule.
   * Demonstrates how modules collaborate via explicit exports/imports.)
   *
   * @returns string — Câu trích dẫn lời mèo (EN: quote of what the cat said)
   */
  spyOnCat(): string {
    // Log để trace luồng cross-module call tại runtime
    // (EN: Log to trace the cross-module call flow at runtime)
    this.logger.log('🐶 Dog is peeking at the cat...');

    // Gọi CatService.introduce() — đây là cross-module DI injection trong thực tế
    // (EN: Call CatService.introduce() — this is real cross-module DI injection in action)
    const catIntro = this.catService.introduce();

    return `Dog says: "I overheard my neighbor say: '${catIntro}'"`;
  }

  /**
   * Chó thách thức mèo để cướp thức ăn — gọi CatService.feedCat() qua cross-module injection.
   * (EN: Dog challenges the cat to steal food — calls CatService.feedCat() via cross-module injection.)
   *
   * @param food - Loại thức ăn muốn cướp (EN: food the dog wants to steal)
   * @returns string — Kết quả sau khi thách thức (EN: result after the challenge)
   */
  challengeCat(food: string): string {
    // Log để trace luồng thách thức với tham số cụ thể
    // (EN: Log to trace the challenge flow with the specific argument)
    this.logger.log(`🐶 Dog challenges cat to share some ${food}!`);

    // Gọi feedCat trên CatService — chứng minh DogService có thể dùng toàn bộ API của CatService
    // (EN: Call feedCat on CatService — proves DogService can consume CatService's full API)
    const result = this.catService.feedCat(food);

    return `Dog tried to steal food! Cat got: ${result}`;
  }
}
