import { IsEmail, IsString, MinLength, IsInt, Min, Max } from 'class-validator';

/**
 * CreateUserDto — Định nghĩa hình dạng dữ liệu khi tạo User mới.
 * Sử dụng class-validator để đặt các quy tắc kiểm tra.
 * (EN: CreateUserDto — Defines data shape for creating a new User.
 * Uses class-validator to enforce rules.)
 */
export class CreateUserDto {
  /**
   * Tên người dùng.
   * (EN: User name.)
   */
  @IsString()
  @MinLength(3, { message: 'Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)' })
  name: string;

  /**
   * Địa chỉ email (PHẢI đúng định dạng email).
   * (EN: Email address (MUST be valid email format).)
   */
  @IsEmail({}, { message: 'Email không hợp lệ (EN: Invalid email)' })
  email: string;

  /**
   * Tuổi người dùng (PHẢI là số từ 18 đến 100).
   * (EN: User age (MUST be integer between 18 and 100).)
   */
  @IsInt()
  @Min(18)
  @Max(100)
  age: number;
}
