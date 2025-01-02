import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from './tentant.schema';
import { TentantController } from './teant.controller';
import { TenantService } from './tenant.service';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }])],
  controllers: [TentantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
