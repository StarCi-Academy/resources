import { ApiProperty } from '@nestjs/swagger';

/**
 * CatDto — Định nghĩa Schema cho Swagger UI.
 * (EN: CatDto — Defines Schema for Swagger UI.)
 */
export class CatDto {
  @ApiProperty({ example: 'Luna', description: 'Tên con mèo' })
  name: string;

  @ApiProperty({ example: 2, description: 'Tuổi con mèo' })
  age: number;
}
