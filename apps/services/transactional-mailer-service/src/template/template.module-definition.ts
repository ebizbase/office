import { ConfigurableModuleBuilder } from '@nestjs/common';

export interface TemplateModuleOptions {
  assetPath: string;
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<TemplateModuleOptions>()
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
