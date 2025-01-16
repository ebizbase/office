import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IamService } from '../core/services/iam.service';
import { HttpErrorResponse } from '@angular/common/http';
import {
  IdentifyFormComponent,
  IdentifyFormSubmmittedEvent,
} from '../core/components/forms/identify.component';

@Component({
  selector: 'app-identify-page',
  standalone: true,
  imports: [CommonModule, RouterModule, IdentifyFormComponent],
  template: `
    <div class="flex flex-col md:flex-row">
      <div class="w-full">
        <h1 class="text-xl md:text-4xl font-semibold leading-tight w-full mb-4">
          Welcome to NextBON
        </h1>
        <h2 class="md:text-lg leading-tight w-full">Enter your email</h2>
      </div>
      <div class="w-full">
        <app-identify-form [isLoading]="isLoading" (formSubmit)="formSubmitted($event)" />
      </div>
    </div>
  `,
})
export class IdentifyPageComponent {
  isLoading = false;

  constructor(
    private router: Router,
    private iam: IamService
  ) {}

  async formSubmitted({ email }: IdentifyFormSubmmittedEvent) {
    this.isLoading = true;
    this.iam.identify(email).subscribe({
      next: ({ data }) => {
        this.router.navigate(['verify-otp'], {
          queryParams: { email, ...data },
        });
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }
}
