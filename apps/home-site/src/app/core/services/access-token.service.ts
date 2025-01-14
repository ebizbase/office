import { SsrCookieService } from 'ngx-cookie-service-ssr';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccessTokenService {
  private readonly accessTokenKey = 'accessToken';
  private readonly refreshTokenKey = 'refreshToken';
  private isLoggedIn$: BehaviorSubject<boolean>;

  constructor(private cookieService: SsrCookieService) {
    this.isLoggedIn$ = new BehaviorSubject<boolean>(this.isLoggedIn());
  }

  /**
   * Đăng xuất và xóa token khỏi cookie
   */
  logout(): void {
    this.clearTokens();
    this.isLoggedIn$.next(false);
  }

  getAccessToken(): string | null {
    return this.cookieService.get(this.accessTokenKey) || null;
  }

  getRefreshToken(): string | null {
    return this.cookieService.get(this.refreshTokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.cookieService.get(this.accessTokenKey);
  }

  /**
   * Quan sát trạng thái đăng nhập
   */
  get isLoggedInObservable(): Observable<boolean> {
    return this.isLoggedIn$.asObservable();
  }

  /**
   * Lưu token vào cookie
   */
  public setTokens(accessToken: string, refreshToken: string): void {
    this.cookieService.set(this.accessTokenKey, accessToken);
    this.cookieService.set(this.refreshTokenKey, refreshToken);
  }

  private clearTokens(): void {
    this.cookieService.delete(this.accessTokenKey, '/');
    this.cookieService.delete(this.refreshTokenKey, '/');
  }
}
