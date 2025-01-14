import { Inject, Injectable } from '@angular/core';
import { WA_LOCATION } from '@ng-web-apis/common';

@Injectable({
  providedIn: 'root',
})
export class DomainService {
  public readonly rootDomain: string;
  public readonly protocol: string;

  constructor(@Inject(WA_LOCATION) private location: Location) {
    let host = this.location.host;
    if (host.startsWith('127.0.0.1') || host.startsWith('localhost')) {
      host = 'fbi.com';
    }
    this.rootDomain = host;
    this.protocol = this.location.protocol;
  }
}
