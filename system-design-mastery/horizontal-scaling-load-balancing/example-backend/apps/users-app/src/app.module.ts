import { Module } from '@nestjs/common';
import { createServiceController } from '../../../libs/base.controller';

/**
 * Dataset giả lập cho users (EN: mock user dataset)
 */
interface User { id: number; name: string; email: string }
const USERS: User[] = [
  { id: 1, name: 'Alice Nguyen',   email: 'alice@acme.test'   },
  { id: 2, name: 'Bob Tran',       email: 'bob@acme.test'     },
  { id: 3, name: 'Charlie Le',     email: 'charlie@acme.test' },
  { id: 4, name: 'Diana Pham',     email: 'diana@acme.test'   },
];

// Controller được sinh bởi factory, gắn path `/api/users` để khớp Ingress rule
// (EN: factory-generated controller mounted at `/api/users` to match Ingress rule)
const UsersController = createServiceController<User>('users-app', 'api/users', USERS);

@Module({ controllers: [UsersController] })
export class AppModule {}
