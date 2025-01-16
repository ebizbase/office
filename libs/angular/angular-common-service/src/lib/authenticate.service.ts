import { SsrCookieService } from 'ngx-cookie-service-ssr';
import { BehaviorSubject, Observable } from 'rxjs';
import { DomainService } from './domain.service';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthenticateService {
  private readonly accessTokenKey = 'actk';
  private readonly refreshTokenKey = 'rftk';
  private isLoggedIn$: BehaviorSubject<boolean>;

  constructor(private cookieService: SsrCookieService, private domain: DomainService) {
    this.isLoggedIn$ = new BehaviorSubject<boolean>(this.isLoggedIn);
  }

  get isLoggedInObservable(): Observable<boolean> {
    return this.isLoggedIn$.asObservable();
  }

  get accessToken() {
    return this.cookieService.get(this.accessTokenKey);
  }


  logout(): void {
    this.cookieService.delete(this.accessTokenKey, '/');
    this.cookieService.delete(this.refreshTokenKey, '/');
    this.isLoggedIn$.next(false);
  }

  get isLoggedIn(): boolean {
    return !!this.cookieService.get(this.accessTokenKey);
  }

  setTokens(accessToken: string, accessTokenExpiredAt: Date, refreshToken: string, refreshTokenExpiredAt: Date): void {
    const options = { path: '/', domain: `.${this.domain.RootDomain}` };
    this.cookieService.set(this.accessTokenKey, accessToken, { ...options, expires: accessTokenExpiredAt });
    this.cookieService.set(this.refreshTokenKey, refreshToken, { ...options, expires: refreshTokenExpiredAt });
  }

  refreshAccessToken(){
    // const refreshToken = this.cookieService.get(this.refreshTokenKey);

  }



}
