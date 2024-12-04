import axios from 'axios';

export interface MailHogSearchResponse {
  total: number;
  count: number;
  start: number;
  items: MailItem[];
}

export interface MailItem {
  ID: string;
  From: MailAddress;
  To: MailAddress[];
  Content: MailContent;
  Created: string;
  MIME: MIMEContent;
  Raw: RawContent;
}

export interface MailAddress {
  Relays: string[] | null;
  Mailbox: string;
  Domain: string;
  Params: string;
}

export interface MailContent {
  Headers: Record<string, string[]>;
  Body: string;
  Size: number;
  MIME: MIMEContent | null;
}

export interface MIMEContent {
  Parts: MIMEPart[];
}

export interface MIMEPart {
  Headers: Record<string, string[]>;
  Body: string;
  Size: number;
  MIME: MIMEContent | null;
}

export interface RawContent {
  From: string;
  To: string[];
  Data: string;
  Helo: string;
}

export class MailHogClient {
  public static baseUrl = 'http://localhost:8025';

  public static getClient() {
    return axios.create({
      baseURL: this.baseUrl,
    });
  }

  public static async waitForEmail(to: string, timeout = 10000) {
    return Promise.race<MailItem>([
      this.waitForEmailPromise(to),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout waiting for email')), timeout)
      ),
    ]);
  }

  private static waitForEmailPromise(to: string): Promise<MailItem> {
    return new Promise((resolve) => {
      const client = this.getClient();
      const interval = setInterval(async () => {
        try {
          const response = await client.get(`/api/v2/search?kind=to&query=${to}`);
          const messages = response.data as MailHogSearchResponse;
          const message = messages.items.find((m) => m.Content.Headers['To'].includes(to));
          if (message) {
            clearInterval(interval);
            resolve(message);
          }
        } catch (error) {
          // Do nothing
          console.warn('Error waiting for email', error);
        }
      }, 500);
    });
  }
}
