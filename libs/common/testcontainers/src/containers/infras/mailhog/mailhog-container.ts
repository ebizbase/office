import {
  AbstractStartedContainer,
  GenericContainer,
  StartedTestContainer,
  Wait,
} from 'testcontainers';
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

export class MailHogContainer extends GenericContainer {
  constructor(image?: string) {
    super(image || 'mailhog/mailhog');
    this.withExposedPorts(8025, 1025);
    this.waitStrategy = Wait.forListeningPorts();
  }

  override async start(): Promise<StartedMailHogContainer> {
    const staredContainer = await super.start();
    return new StartedMailHogContainer(staredContainer);
  }
}

export class StartedMailHogContainer extends AbstractStartedContainer {
  constructor(container: StartedTestContainer) {
    super(container);
  }

  getSmtpUri(): string {
    return `smtp://${this.getHost()}:${this.getMappedPort(1025)}`;
  }

  getMailhogApiUri(): string {
    return `http://${this.getHost()}:${this.getMappedPort(8025)}`;
  }

  async clearEmails() {
    await axios.delete(`${this.getMailhogApiUri()}/api/v1/messages`);
  }

  async search(
    query: string,
    kind: 'to' | 'from' | 'containing' = 'to'
  ): Promise<MailHogSearchResponse> {
    const response = await axios.get(
      `${this.getMailhogApiUri()}/api/v2/search?kind=${kind}&query=${query}`
    );
    return response.data as MailHogSearchResponse;
  }

  async waitForEmail(to: string, timeout = 10000): Promise<Array<MailItem>> {
    let timeoutId: NodeJS.Timeout; // Biến để lưu ID của timer

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
