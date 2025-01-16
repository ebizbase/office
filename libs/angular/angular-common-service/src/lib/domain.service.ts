import { Inject, Injectable } from '@angular/core';
import { WA_LOCATION } from '@ng-web-apis/common';

@Injectable({ providedIn: 'root' })
export class DomainService {
  public readonly Protocol: string;
  public readonly RootDomain: string;
  public readonly IamServiceDomain: string;
  public readonly StaticAssetDomain: string;

  constructor(
    @Inject(WA_LOCATION) private location: Location,
    @Inject('DOMAIN') private rootDomain: string
  ) {
    this.Protocol = this.location.protocol;
    this.RootDomain = this.rootDomain;
    this.IamServiceDomain = this.Protocol + '//iam-service.' + this.RootDomain;
    this.StaticAssetDomain = this.Protocol + '//static-assets.' + this.RootDomain;
  }
}
