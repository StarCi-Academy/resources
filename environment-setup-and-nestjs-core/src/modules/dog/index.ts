// Barrel export cho DogModule — import qua đây, không import deep path
// (EN: Barrel export for DogModule — import from here, never use deep paths)
// Usage: import { DogService, DogModule } from '@/modules/dog'
export * from './dog.service';
export * from './dog.controller';
export * from './dog.module';
