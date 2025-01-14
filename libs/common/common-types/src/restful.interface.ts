import { Dict } from './common-types';

export interface IRestfulResponse<T = unknown> {
  message?: string;
  errors?: Dict<string>;
  data?: T;
}
