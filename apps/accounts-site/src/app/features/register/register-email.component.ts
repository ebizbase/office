import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  RegisterEmailFormComponent,
  RegisterEmailFormSubmitEvent,
} from '../../core/components/forms/register/register-email.component';
import { IamService } from '../../core/services/iam.service';

@Component({
  selector: 'app-register-email',
  standalone: true,
  imports: [CommonModule, RouterModule, RegisterEmailFormComponent],
  template: `
    <div class="flex flex-col md:flex-row">
      <div class="w-full">
        <h1 class="text-xl md:text-4xl font-semibold leading-tight w-full mb-4">
          Hi {{ firstName }} {{ lastName }}
        </h1>
        <h2 class="md:text-lg leading-tight w-full">Enter your email</h2>
      </div>
      <div class="w-full py-4">
        <app-register-email-form [isLoading]="isLoading" (formSubmit)="formSubmitted($event)" />
      </div>
    </div>
  `,
})
export class RegisterEmailComponent {
  isLoading = false;

  @ViewChild(RegisterEmailFormComponent) signInFormComponent!: RegisterEmailFormComponent;
  firstName: string;
  lastName: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private iamService: IamService
  ) {
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams['firstName'] === undefined || queryParams['lastName'] === undefined) {
      this.router.navigate(['register', 'steps', 'name']);
    } else {
      this.firstName = queryParams['firstName'];
      this.lastName = queryParams['lastName'];
    }
  }

  async formSubmitted({ email }: RegisterEmailFormSubmitEvent) {
    this.isLoading = true;
    this.iamService
      .register({ email, firstName: this.firstName, lastName: this.lastName })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['sign-in', 'steps', 'verify-otp'], { queryParams: { email } });
        },
        error: (error) => {
          console.log(error);
        },
      });
  }
}
