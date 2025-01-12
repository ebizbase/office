import { Dict } from './common-types';

export interface IRestfulResponse<T = unknown> {
  statusCode: number;
  message?: string;
  errors?: Dict<string>;
  data?: T;
}
