import { SsrCookieService } from 'ngx-cookie-service-ssr';
import { ILoginResponseData } from '@ebizbase/iam-interfaces';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DomainService } from './host.service';
import { IRestfulResponse } from '@ebizbase/common-types';

@Injectable({
  providedIn: 'root',
})
export class IamService {
  private readonly accessTokenKey = 'actk';

  private readonly refreshTokenKey = 'rftk';

  private isLoggedIn$: BehaviorSubject<boolean>;

  constructor(
    private cookieService: SsrCookieService,
    private domain: DomainService,
    private http: HttpClient
  ) {
    this.isLoggedIn$ = new BehaviorSubject<boolean>(this.isLoggedIn());
  }

  get isLoggedInObservable(): Observable<boolean> {
    return this.isLoggedIn$.asObservable();
  }

  identify(email: string): Observable<IRestfulResponse<object>> {
    const url = `${this.domain.IamServiceDomain}/authenticate?email=${email}`;
    return this.http.get(url).pipe();
  }

  verifyOtp(email: string, otp: string): Observable<IRestfulResponse<ILoginResponseData>> {
    const url = `${this.domain.IamServiceDomain}/authenticate?email=${email}`;
    return this.http.post<IRestfulResponse<ILoginResponseData>>(url, { email, otp }).pipe(
      tap(({ data }) => {
        this.setTokens(data.accessToken, data.refreshToken);
      })
    );
  }

  logout(): void {
    this.clearTokens();
    this.isLoggedIn$.next(false);
  }

  isLoggedIn(): boolean {
    return !!this.cookieService.get(this.accessTokenKey);
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    this.cookieService.set(this.accessTokenKey, accessToken);
    this.cookieService.set(this.refreshTokenKey, refreshToken);
  }

  private clearTokens(): void {
    this.cookieService.delete(this.accessTokenKey, '/');
    this.cookieService.delete(this.refreshTokenKey, '/');
  }
}
