import {
  Body,
  Controller,
  Logger,
  Post,
  UseGuards,
  Req,
  Get,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { ITenantRequest } from '@ebizbase/iam-interfaces';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { IAccessTokenPayload } from '@ebizbase/iam-interfaces';

@Controller('tenants')
export class TentantController {
  private readonly logger = new Logger(TentantController.name);

  constructor(private readonly tenantService: TenantService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  async list(@Req() { accessTokenPayload }: { accessTokenPayload: IAccessTokenPayload }) {
    this.logger.debug({ msg: 'Creating Tenant', accessTokenPayload });
    return this.tenantService.findByUserId(accessTokenPayload.userId);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  async create(
    @Body() body: ITenantRequest,
    @Req() { accessTokenPayload }: { accessTokenPayload: IAccessTokenPayload }
  ) {
    this.logger.debug({ msg: 'Creating Tenant', body, accessTokenPayload });
    return this.tenantService.create(body, accessTokenPayload);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  async delete(
    @Param('id') tenantId: string,

    @Query('otp') otp: string,
    @Req() { accessTokenPayload }: { accessTokenPayload: IAccessTokenPayload }
  ) {
    this.logger.debug({ msg: 'Deleting Tenant', tenantId });
    return this.tenantService.deleteById(tenantId, accessTokenPayload.userId, otp);
  }
}
