import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './transporter.module-definition';
import { TransporterService } from './transporter.service';

@Module({
  providers: [TransporterService],
  exports: [TransporterService],
})
export class TransporterModule extends ConfigurableModuleClass {}
