import { Inject, Logger, Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Template, TemplateSchema } from './template.schema';
import { TemplateService } from './template.service';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { TemplateController } from './template.controller';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  TemplateModuleOptions,
} from './template.module-definition';

@Module({
  imports: [MongooseModule.forFeature([{ name: Template.name, schema: TemplateSchema }])],
  controllers: [TemplateController],
  providers: [TemplateService],
  exports: [TemplateService],
})
export class TemplateModule extends ConfigurableModuleClass implements OnModuleInit {
  private readonly logger = new Logger(TemplateModule.name);
  @Inject(TemplateService) private readonly templateService: TemplateService;

  constructor(@Inject(MODULE_OPTIONS_TOKEN) private readonly options: TemplateModuleOptions) {
    super();
  }

  async onModuleInit() {
    const seedingTemplates = readdirSync(join(this.options.assetPath, 'templates'));
    this.logger.debug({ initializeTemplates: seedingTemplates, msg: 'Seeding templates' });
    const existTemplates = (await this.templateService.getTemplates()).map(
      (template) => template.slug
    );
    this.logger.debug({ existTemplates, msg: 'Existing templates' });
    const missingTemplates = seedingTemplates.filter(
      (template) => !existTemplates.includes(template)
    );
    this.logger.log({ missingTemplates, msg: 'Initialize templates' });

    missingTemplates.forEach(async (file) => {
      this.logger.log(`Loading template: ${file}`);
      const slug = file;
      const html = readFileSync(
        join(this.options.assetPath, 'templates', file, 'html.hbs'),
        'utf-8'
      );
      const text = readFileSync(
        join(this.options.assetPath, 'templates', file, 'text.hbs'),
        'utf-8'
      );
      const { subject } = JSON.parse(
        readFileSync(join(this.options.assetPath, 'templates', file, 'info.json'), 'utf-8')
      );
      const result = await this.templateService.createTemplate({ slug, html, text, subject });
      this.logger.log({ slug: result.slug, msg: 'Template created' });
    });
  }
}
