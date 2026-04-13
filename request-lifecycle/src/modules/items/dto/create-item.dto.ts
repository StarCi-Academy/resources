import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

/**
 * CreateItemDto — Data Transfer Object cho request tạo item mới.
 * Dùng class-validator để validate body ngay tại Pipe layer — trước khi vào controller.
 * (EN: Data Transfer Object for the create-item request.
 * Uses class-validator to validate the body at the Pipe layer — before entering the controller.)
 *
 * Tại sao dùng DTO class thay vì plain interface?
 *   - Interface bị xóa sau khi compile JS — không thể reflect metadata.
 *   - Class tồn tại ở runtime, ValidationPipe cần reflect metadata để biết loại từng property.
 * (EN: Why use a DTO class instead of a plain interface?
 *   - Interfaces are erased after JS compilation — metadata cannot be reflected.
 *   - Classes exist at runtime; ValidationPipe needs reflected metadata to know each property's type.)
 *
 * Flow: POST /items body → ValidationPipe → class-transformer plain→class → class-validator validate → handler
 * (EN: Flow: POST /items body → ValidationPipe → class-transformer plain→class → class-validator validate → handler)
 */
export class CreateItemDto {
  /**
   * Tên của item mới.
   * (EN: Name of the new item.)
   *
   * Rules:
   *   - Bắt buộc, không được rỗng (EN: required, must not be empty)
   *   - Phải là string (EN: must be a string)
   *   - Tối thiểu 2 ký tự, tối đa 50 ký tự (EN: minimum 2 chars, maximum 50 chars)
   */
  @IsString({ message: 'name phải là chuỗi ký tự (EN: name must be a string)' })
  @IsNotEmpty({ message: 'name không được để trống (EN: name must not be empty)' })
  @MinLength(2, { message: 'name phải có ít nhất 2 ký tự (EN: name must be at least 2 characters)' })
  @MaxLength(50, { message: 'name tối đa 50 ký tự (EN: name must be at most 50 characters)' })
  name: string;

  /**
   * Mô tả chi tiết của item.
   * (EN: Detailed description of the item.)
   *
   * Rules:
   *   - Bắt buộc, không được rỗng (EN: required, must not be empty)
   *   - Phải là string (EN: must be a string)
   *   - Tối thiểu 5 ký tự, tối đa 200 ký tự (EN: minimum 5 chars, maximum 200 chars)
   */
  @IsString({ message: 'description phải là chuỗi ký tự (EN: description must be a string)' })
  @IsNotEmpty({ message: 'description không được để trống (EN: description must not be empty)' })
  @MinLength(5, { message: 'description phải có ít nhất 5 ký tự (EN: description must be at least 5 characters)' })
  @MaxLength(200, { message: 'description tối đa 200 ký tự (EN: description must be at most 200 characters)' })
  description: string;
}
