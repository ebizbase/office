import { ConfigurableModuleBuilder } from '@nestjs/common';
import SMTPPool from 'nodemailer/lib/smtp-pool';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<SMTPPool.Options>({
    moduleName: 'Mailer',
  })
    .setExtras(
      {
        isGlobal: true,
      },
      (definition, extras) => ({
        ...definition,
        global: extras.isGlobal,
      })
    )
    .build();
