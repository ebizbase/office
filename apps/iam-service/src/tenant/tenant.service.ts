import { ITenantRequest } from '@ebizbase/iam-interfaces';
import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectTenantModel, Role, Tenant, TenantModel } from './tentant.schema';
import { UserService } from '../user/user.service';
import { IAccessTokenPayload } from '@ebizbase/iam-interfaces';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    @InjectTenantModel() private readonly tenantModel: TenantModel,
    private readonly userService: UserService
  ) {}

  async create(body: ITenantRequest, accessTokenPayload: IAccessTokenPayload) {
    const user = await this.userService.findById(accessTokenPayload.userId);
    const defaultRoles: Role[] = [];
    this.logger.debug({ msg: 'Creating Tenant', body });
    return this.tenantModel.create({ ...body, ownerId: user.id, roles: defaultRoles, staffs: [] });
  }

  async findByUserId(userId: string): Promise<Tenant[]> {
    return await this.tenantModel
      .find({
        $or: [{ ownerId: userId }, { 'staffs.userId': userId }],
      })
      .exec();
  }

  async deleteById(tenantId: string, userId: string, otp: string) {
    const tenant = await this.tenantModel.findById(tenantId);
    if (tenant.ownerId !== userId) {
      throw new ForbiddenException();
    }
    const user = await this.userService.findById(userId);
    if (!(await this.userService.verifyHOTP(user, otp))) {
      throw new BadRequestException({
        message: 'OTP invalid',
      });
    }
    await this.tenantModel.findByIdAndDelete(tenantId);
  }
}
