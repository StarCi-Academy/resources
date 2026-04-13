/**
 * User — Thực thể đại diện cho người dùng trong hệ thống.
 * (EN: User — Entity representing a user in the system.)
 */
export class User {
  /**
   * ID duy nhất của người dùng (EN: Unique ID of the user)
   */
  id: string;

  /**
   * Tên hiển thị (EN: Display name)
   */
  name: string;

  /**
   * Địa chỉ email (EN: Email address)
   */
  email: string;
}
