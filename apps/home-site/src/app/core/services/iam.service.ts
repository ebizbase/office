import { ILoginRequest, ILoginResponse, IRegisterRequest } from '@ebizbase/iam-interfaces';
import { Injectable } from '@angular/core';
import { IRestfulResponse } from '@ebizbase/common-types';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DomainService } from './host.service';
import { AccessTokenService } from './access-token.service';

@Injectable({
  providedIn: 'root',
})
export class IamService {
  private readonly baseURL: string;

  constructor(
    private domain: DomainService,
    private accessToken: AccessTokenService,
    private http: HttpClient
  ) {
    this.baseURL = this.domain.protocol + '//iam-service.' + this.domain.rootDomain;
  }

  register(data: IRegisterRequest): Observable<IRestfulResponse> {
    return this.http.post<IRestfulResponse>(`${this.baseURL}/authenticate/register`, data).pipe();
  }

  signIn(data: ILoginRequest): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(`${this.baseURL}/authenticate/sign-in`, data).pipe(
      tap(({ accessToken, refreshToken }) => {
        console.log(accessToken, refreshToken);
        this.accessToken.setTokens(accessToken, refreshToken);
      })
    );
  }
}
