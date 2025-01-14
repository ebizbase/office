import { Inject, Injectable } from '@angular/core';
import { WA_LOCATION } from '@ng-web-apis/common';

@Injectable({
  providedIn: 'root',
})
export class DomainService {

  public readonly host: string;
  public readonly protocol: string;

  constructor(
    @Inject('DOMAIN') private readonly domain: string,
    @Inject(WA_LOCATION) private location: Location
  ) {
    this.host = this.domain;
    this.protocol = this.location.protocol;
  }
}
