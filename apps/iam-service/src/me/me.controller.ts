import { Controller, Get, HttpCode, Logger, Req, UseGuards } from '@nestjs/common';
import { IMeResponse } from '@ebizbase/iam-interfaces';
import { IAccessTokenPayload } from '@ebizbase/iam-interfaces';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { MeService } from './me.service';

@Controller('me')
export class MeController {
  private logger = new Logger(MeController.name);

  constructor(private readonly meService: MeService) {}

  @Get()
  @HttpCode(200)
  @UseGuards(AccessTokenGuard)
  async me(
    @Req() { accessTokenPayload }: { accessTokenPayload: IAccessTokenPayload }
  ): Promise<IMeResponse> {
    this.logger.debug({ msg: 'Getting current user information', accessTokenPayload });
    return this.meService.getCurrentUser(accessTokenPayload);
  }
}
