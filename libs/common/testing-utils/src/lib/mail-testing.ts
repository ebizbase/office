import { Dict } from '@ebizbase/common-types';
import axios from 'axios';

export interface IMailAddress {
  address: string;
  name: string;
}

export interface MailObject {
  subject: string;
  id: string;
  from: IMailAddress[];
  to: IMailAddress[];
  date: string;
  time: string;
  html: string;
  text: string;
}

export class MailTestingClient {
  constructor(private baseUrl: string) {}

  async clearEmails() {
    await axios.delete(`${this.baseUrl}/email/all`);
  }

  async search(params: Dict<string>): Promise<MailObject[]> {
    const url = `${this.baseUrl}/email`;
    const response = await axios.get(url, { params });
    return response.data as MailObject[];
  }

  async waitForEmail(params: Dict<string>, timeout = 30000): Promise<MailObject[]> {
    let timeoutId: NodeJS.Timeout;

    const timeoutPromise = new Promise<MailObject[]>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(
          new Error(
            `Timeout waiting for email ${JSON.stringify(params)} after ${timeout ?? 15000}ms`
          )
        );
      }, timeout ?? 15000);
    });

    return Promise.race<MailObject[]>([this.waitForEmailPromise(params), timeoutPromise]).finally(
      () => {
        clearTimeout(timeoutId);
      }
    );
  }

  private waitForEmailPromise(params: Dict<string>): Promise<MailObject[]> {
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        try {
          const items = await this.search(params);
          if (items.length > 0) {
            clearInterval(interval);
            resolve(items);
          }
        } catch (error) {
          throw new Error(`Error waiting for email ${error}`);
        }
      }, 10);
    });
  }
}

export class MailTesting {
  public static async getClient(baseUrl = 'http://mail.fbi.com'): Promise<MailTestingClient> {
    return new MailTestingClient(baseUrl);
  }
}
