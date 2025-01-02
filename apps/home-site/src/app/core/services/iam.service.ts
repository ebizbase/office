import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { WA_LOCATION } from '@ng-web-apis/common';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IamService {
  private readonly baseURL: string;

  constructor(
    private http: HttpClient,
    @Inject(WA_LOCATION) private location: Location
  ) {
    this.baseURL = this.location.protocol + '//iam-service.' + this.location.host;
    console.log(this.baseURL);
  }

  getOtp(): Observable<void> {
    return this.http.get<void>(`${this.baseURL}/`);
  }
}
