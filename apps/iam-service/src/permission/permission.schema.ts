import { Prop, SchemaFactory } from '@nestjs/mongoose';

export class Permission {
  @Prop({ required: true, unique: true }) name: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
