import { isPlatformServer } from '@angular/common';
import {
  Inject,
  Injectable,
  makeStateKey,
  Optional,
  PLATFORM_ID,
  TransferState,
} from '@angular/core';
import { WA_LOCATION } from '@ng-web-apis/common';

const domainStateKey = makeStateKey<string>('DOMAIN');

@Injectable({ providedIn: 'root' })
export class DomainService {
  public readonly Protocol: string;
  public readonly RootDomain: string;
  public readonly MyAccountSiteDomain: string;
  public readonly AccountsSiteDomain: string;
  public readonly IamServiceDomain: string;
  public readonly StaticAssetsDomain: string;
  public readonly IamServiceBaseURL: string;
  public readonly StaticAssetsBaseURL: string;
  public readonly AccountsSiteBaseURL: string;
  public readonly MyAccountBaseURL: string;

  constructor(
    private transferState: TransferState,
    @Inject(WA_LOCATION) private location: Location,
    @Inject(PLATFORM_ID) private platformId: object,
    @Optional() @Inject('DOMAIN') private domainEnviroment: string
  ) {
    if (isPlatformServer(this.platformId)) {
      this.RootDomain = this.domainEnviroment;
      this.transferState.set(domainStateKey, this.RootDomain);
    } else {
      this.RootDomain = this.transferState.get(domainStateKey, '');
    }
    console.debug('Root Domain', this.RootDomain);
    this.Protocol = this.location.protocol;
    this.IamServiceDomain = 'iam-service.' + this.RootDomain;
    this.IamServiceBaseURL = this.Protocol + '//' + this.IamServiceDomain;

    this.StaticAssetsDomain = 'static-assets.' + this.RootDomain;
    this.StaticAssetsBaseURL = this.Protocol + '//' + this.StaticAssetsDomain;

    this.AccountsSiteDomain = 'accounts.' + this.RootDomain;
    this.AccountsSiteBaseURL = this.Protocol + '//' + this.AccountsSiteDomain;

    this.MyAccountSiteDomain = 'my-account.' + this.RootDomain;
    this.MyAccountBaseURL = this.Protocol + '//' + this.MyAccountSiteDomain;
  }
}
