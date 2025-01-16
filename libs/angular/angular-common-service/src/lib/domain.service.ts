import { Inject, Injectable, makeStateKey, Optional, PLATFORM_ID, TransferState } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { WA_LOCATION } from '@ng-web-apis/common';

const domainStateKey = makeStateKey<string>('DOMAIN');


@Injectable({ providedIn: 'root' })
export class DomainService {
  public readonly Protocol: string;
  public readonly RootDomain: string;
  public readonly MyAccountSiteDomain: string;
  public readonly AccountsSiteDomain: string;
  public readonly IamServiceDomain: string;
  public readonly StaticAssetDomain: string;

  constructor(
    private transferState: TransferState,
    @Inject(WA_LOCATION) private location: Location,
    @Inject(PLATFORM_ID) private platformId: object,
    @Optional() @Inject('DOMAIN') private domainEnviroment: string,
  ) {
    if (isPlatformServer(this.platformId)) {
      this.RootDomain = this.domainEnviroment;
      this.transferState.set(domainStateKey, this.RootDomain);
    } else {
      this.RootDomain = this.transferState.get(domainStateKey, '');
    }
    this.Protocol = this.location.protocol;
    this.IamServiceDomain = this.Protocol + '//iam-service.' + this.RootDomain;
    this.StaticAssetDomain = this.Protocol + '//static-assets.' + this.RootDomain;
    this.AccountsSiteDomain = this.Protocol + '//accounts.' + this.RootDomain;
    this.MyAccountSiteDomain = this.Protocol + '//my-account.' + this.RootDomain;

  }
}
