import { Inject } from '@angular/core';
import { WA_LOCATION } from '@ng-web-apis/common';

export class AppService {
  constructor(@Inject(WA_LOCATION) private location: Location) {
    console.log('location', this.location);
  }

  public getHost(): string {
    return this.location.host;
  }
}
