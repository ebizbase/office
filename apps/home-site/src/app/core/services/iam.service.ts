import { Inject, Injectable } from '@angular/core';
import { IRestfulResponse } from '@ebizbase/common-types';
import { WA_LOCATION } from '@ng-web-apis/common';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IamService {
  private readonly baseURL: string;

  constructor(@Inject(WA_LOCATION) private location: Location) {
    let host = this.location.host;
    if (host.startsWith('127.0.0.1') || host.startsWith('localhost')) {
      host = 'fbi.com';
    }
    this.baseURL = this.location.protocol + '//iam-service.' + host;
    console.log('iam-service', { baseURL: this.baseURL });
  }

  identify(email: string): Observable<IRestfulResponse> {
    console.log('indentify', { email });
    return from([]);
  }

  verify(email: string, otp: string): Observable<IRestfulResponse> {
    console.log('verify', { email, otp });
    return from([]);
  }
}
