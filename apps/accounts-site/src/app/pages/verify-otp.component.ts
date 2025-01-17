import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomainService } from '@ebizbase/angular-common-service';
import {
  OtpVerifyFormComponent,
  OtpVerifyFormSubmitEvent,
} from '../core/components/forms/otp-verify.component';
import { IamService } from '../core/services/iam.service';
import { WA_LOCATION } from '@ng-web-apis/common';

@Component({
  selector: 'app-identify-verify-otp-page',
  standalone: true,
  imports: [CommonModule, OtpVerifyFormComponent],
  template: `
    <div class="flex flex-col md:flex-row">
      <div class="w-full">
        <h1 class="text-xl md:text-4xl font-semibold leading-tight w-full mb-4">
          OTP Verification
        </h1>
        <h2 class="md:text-lg leading-tight w-full">Enter the one time password</h2>
      </div>
      <div class="w-full py-4">
        <app-otp-verify-form
          [email]="email"
          [isLoading]="isLoading"
          (formSubmit)="formSubmitted($event)"
        />
      </div>
    </div>
  `,
})
export class VerifyOTPPageComponent {
  email: string;
  firstName: string;
  lastName?: string;
  isLoading = false;

  constructor(
    @Inject(WA_LOCATION) private location: Location,
    private route: ActivatedRoute,
    private domain: DomainService,
    private iam: IamService
  ) {
    this.email = this.route.snapshot.queryParams['email'];
    this.firstName = this.route.snapshot.queryParams['firstName'];
    this.lastName = this.route.snapshot.queryParams['lastName'];
  }

  async formSubmitted({ otp }: OtpVerifyFormSubmitEvent) {
    this.iam.verifyOtp({ email: this.email, otp }).subscribe({
      next: () => {
        let redirectUrl: string;
        const continueParam = this.route.snapshot.queryParams['continue'];
        if (continueParam) {
          if (this.firstName !== undefined && this.firstName !== '') {
            redirectUrl = `${this.domain.Protocol}//${this.domain.MyAccountSiteDomain}?continue=${continueParam}`;
          } else {
            redirectUrl = continueParam;
          }
        } else {
          redirectUrl = `${this.domain.Protocol}//${this.domain.MyAccountSiteDomain}`;
        }
        this.location.href = redirectUrl;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }
}
