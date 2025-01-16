import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  OtpVerifyFormComponent,
  OtpVerifyFormSubmitEvent,
} from '../core/components/forms/otp-verify.component';
import { ActivatedRoute } from '@angular/router';
import { IamService } from '../core/services/iam.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DomainService } from '../core/services/host.service';

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
        <h2 class="md:text-lg leading-tight w-full">Enter the OTP you received at {{ email }}</h2>
      </div>
      <div class="w-full py-4">
        <app-otp-verify-form [isLoading]="isLoading" (formSubmit)="formSubmitted($event)" />
      </div>
    </div>
  `,
})
export class VerifyOTPPageComponent {
  email: string;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private domain: DomainService,
    private iam: IamService
  ) {
    this.email = this.route.snapshot.queryParams['email'];
  }

  async formSubmitted({ otp }: OtpVerifyFormSubmitEvent) {
    this.iam.verifyOtp(this.email, otp).subscribe({
      next: () => {
        const continueParam = this.route.snapshot.queryParams['continue'];
        window.location.href =
          continueParam ?? `${this.domain.Protocol}//${this.domain.RootDomain}`;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }
}
