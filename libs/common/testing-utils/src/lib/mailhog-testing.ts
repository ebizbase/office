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
  constructor(private baseUrl: string) {}

  async clearEmails() {
    await axios.delete(`${this.baseUrl}/api/v1/messages`);
  }

  async search(
    query: string,
    kind: 'to' | 'from' | 'containing' = 'to'
  ): Promise<MailHogSearchResponse> {
    const response = await axios.get(`${this.baseUrl}/api/v2/search?kind=${kind}&query=${query}`);
    return response.data as MailHogSearchResponse;
  }

  async waitForEmail(to: string, timeout = 20000): Promise<Array<MailItem>> {
    let timeoutId: NodeJS.Timeout;

    const timeoutPromise = new Promise<MailItem[]>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Timeout waiting for email to ${to} after ${timeout}ms`));
      }, timeout);
    });

    return Promise.race<Array<MailItem>>([this.waitForEmailPromise(to), timeoutPromise]).finally(
      () => {
        clearTimeout(timeoutId);
      }
    );
  }
  private waitForEmailPromise(to: string): Promise<Array<MailItem>> {
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        try {
          const { items } = await this.search(to);
          if (items.length > 0) {
            clearInterval(interval);
            resolve(items);
          }
        } catch (error) {
          throw new Error(`Error waiting for email ${error}`);
        }
      }, 1);
    });
  }
}

export class MailHogTesting {
  public static async getClient(baseUrl = 'http://mail.fbi.com'): Promise<MailHogClient> {
    return new MailHogClient(baseUrl);
  }
}