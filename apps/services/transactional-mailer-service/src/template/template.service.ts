import { Injectable } from '@nestjs/common';
import { Template } from './template.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class TemplateService {
  constructor(@InjectModel(Template.name) private template: Model<Template>) {}

  async getTemplates(): Promise<Template[]> {
    return this.template.find();
  }

  async createTemplate(template: Template): Promise<Template> {
    const createdTemplate = new this.template(template);
    return createdTemplate.save();
  }

  async getTemplate(slug: string) {
    return this.template.findOne({ slug });
  }

  async updateTemplate(slug: string, body: Partial<Omit<Template, 'slug'>>) {
    return this.template.findOneAndUpdate({ slug }, body);
  }
}
