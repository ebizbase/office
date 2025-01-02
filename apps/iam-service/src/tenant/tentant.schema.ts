import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export class Role {
  name: string;
  permissions: Array<string>;
}

export class Staff {
  userId: string;
  roleId?: Role;
}

@Schema()
export class Tenant {
  @Prop({ required: true, unique: true })
  identify: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  ownerId: string;

  @Prop({ required: true, type: [Role] })
  roles: Role[];

  @Prop({ required: true, type: [Staff] })
  staffs: Array<Staff>;
}

export const InjectTenantModel = () => InjectModel(Tenant.name);
export type TenantModel = Model<Tenant>;
export type TenantDocument = HydratedDocument<Tenant>;
export const TenantSchema = SchemaFactory.createForClass(Tenant);
