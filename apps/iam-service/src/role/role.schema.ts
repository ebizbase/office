import { Permission } from '../permission/permission.schema';
import { Prop, SchemaFactory } from '@nestjs/mongoose';

export class Role {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  tentantId: string;

  @Prop({ required: true, unique: true })
  permissions: Permission[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
