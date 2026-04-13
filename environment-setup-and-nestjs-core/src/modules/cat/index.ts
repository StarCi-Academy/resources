// Barrel export cho CatModule — import qua đây, không import deep path
// (EN: Barrel export for CatModule — import from here, never use deep paths)
// Usage: import { CatService, CatModule } from '@/modules/cat'
export * from './cat-food.service';
export * from './cat-health.service';
export * from './cat.service';
export * from './cat.controller';
export * from './cat.module';
