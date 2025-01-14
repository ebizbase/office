import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  SignInFormComponent,
  SignInFormSubmitEvent,
} from '../../core/components/forms/sign-in/authenticate-verify.component';
import { IamService } from '../../core/services/iam.service';

@Component({
  selector: 'app-sign-in-verify-otp',
  standalone: true,
  imports: [CommonModule, RouterModule, SignInFormComponent],
  providers: [IamService],
  template: `
    <div class="flex flex-col md:flex-row">
      <div class="w-full">
        <h1 class="text-xl md:text-4xl font-semibold leading-tight w-full mb-4">
          Create a eBizBase Account
        </h1>
        <h2 class="md:text-lg leading-tight w-full">Enter your name</h2>
      </div>
      <div class="w-full py-4">
        <app-sign-in-form [isLoading]="isLoading" (formSubmit)="formSubmitted($event)" />
      </div>
    </div>
  `,
})
export class SignInVerifyOtpComponent {
  email: string;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private iamService: IamService
  ) {
    const queryParams = this.route.snapshot.queryParams;
    if (!queryParams['email']) {
      this.router.navigate(['sign-in', 'steps', 'email']);
    }
    this.email = queryParams['email'];
  }

  async formSubmitted({ otp }: SignInFormSubmitEvent) {
    this.isLoading = true;
    this.iamService.signIn({ email: this.email, otp }).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log(response);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
