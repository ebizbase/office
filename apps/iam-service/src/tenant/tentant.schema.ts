import { SchemaFactory } from '@nestjs/mongoose';
import { Role } from '../role/role.schema';
import { User } from '../user/user.schema';

export class Tenant {
  owner: User;

  staffs: Array<User & { role: Role }>;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
