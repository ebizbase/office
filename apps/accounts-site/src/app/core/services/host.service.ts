import { Inject, Injectable } from '@angular/core';
import { WA_LOCATION } from '@ng-web-apis/common';

@Injectable({
  providedIn: 'root',
})
export class DomainService {
  public readonly Protocol: string;
  public readonly RootDomain: string;
  public readonly IamServiceDomain: string;

  constructor(@Inject(WA_LOCATION) private location: Location) {
    let host = this.location.host;
    if (host.startsWith('127.0.0.1') || host.startsWith('localhost')) {
      host = 'fbi.com';
    }
    this.RootDomain = host;
    this.Protocol = this.location.protocol;
    this.IamServiceDomain = this.Protocol + '//iam-service.' + this.RootDomain;
  }
}
