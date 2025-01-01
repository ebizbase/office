import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Template {
  @Prop({ required: true, unique: true }) slug: string;

  @Prop({ required: true }) subject: string;

  @Prop({ required: true }) text: string;

  @Prop({ required: true }) html: string;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
