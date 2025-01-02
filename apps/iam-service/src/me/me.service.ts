import { IMeResponse } from '@ebizbase/iam-interfaces';
import { Injectable } from '@nestjs/common';
import { IAccessTokenPayload } from '@ebizbase/iam-interfaces';
import { UserService } from '../user/user.service';

@Injectable()
export class MeService {
  constructor(private readonly userService: UserService) {}

  async getCurrentUser(accessTokenPayload: IAccessTokenPayload): Promise<IMeResponse> {
    const user = await this.userService.findById(accessTokenPayload.userId);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
    };
  }
}
