import { Dict, IRestfulResponse } from '@ebizbase/common-types';
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Logger,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { GetOtpInputDTO } from '../dtos/get-otp-input.dto';
import { IdentifyInputDTO } from '../dtos/identify-input.dto';
import { IdentifyOutputDTO } from '../dtos/identify-output.dto';
import { VerifyInputDTO } from '../dtos/verify-input.dto';
import { VerifyOutputDTO } from '../dtos/verify-output.dto';
import { AuthenticateService } from '../services/authenticate.service';

@Controller('authenticate')
export class AuthenticateController {
  private logger = new Logger(AuthenticateController.name);

  constructor(private authenticateService: AuthenticateService) {}

  @Get('')
  @HttpCode(200)
  async identify(
    @Query() queryParams: IdentifyInputDTO
  ): Promise<IRestfulResponse<IdentifyOutputDTO>> {
    this.logger.debug({ msg: 'Getting identity', queryParams });
    return this.authenticateService.identify(queryParams);
  }

  @Patch('')
  @HttpCode(200)
  async getOtp(@Body() body: GetOtpInputDTO): Promise<IRestfulResponse> {
    this.logger.debug({ msg: 'Get OTP', body });
    return this.authenticateService.getOTP(body);
  }

  @Post('')
  @HttpCode(200)
  async verify(
    @Body() body: VerifyInputDTO,
    @Headers() headers: Dict<string>
  ): Promise<IRestfulResponse<VerifyOutputDTO>> {
    this.logger.debug({ msg: 'Verify identity', body });
    return this.authenticateService.verify(body, headers);
  }
}
