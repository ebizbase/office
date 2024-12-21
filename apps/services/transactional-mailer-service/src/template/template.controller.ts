import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { TemplateService } from './template.service';
import { Template } from './template.schema';

@Controller('templates')
export class TemplateController {
  constructor(private templateService: TemplateService) {}

  @Get()
  async getTemplates() {
    return this.templateService.getTemplates();
  }

  @Get(':slug')
  async getTemplate(@Param('slug') slug: string) {
    return this.templateService.getTemplate(slug);
  }

  @Patch(':slug')
  async updateTemplate(@Param('slug') slug: string, @Body() body: Partial<Omit<Template, 'slug'>>) {
    return this.templateService.updateTemplate(slug, body);
  }
}
