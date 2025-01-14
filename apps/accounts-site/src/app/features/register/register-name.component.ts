import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  RegisterNameFormComponent,
  RegisterNameFormSubmmittedEvent,
} from '../../core/components/forms/register/register-name.component';

@Component({
  selector: 'app-register-name',
  standalone: true,
  imports: [CommonModule, RouterModule, RegisterNameFormComponent],
  template: `
    <div class="flex flex-col md:flex-row">
      <div class="w-full">
        <h1 class="text-xl md:text-4xl font-semibold leading-tight w-full mb-4">
          Create a eBizBase Account
        </h1>
        <h2 class="md:text-lg leading-tight w-full">Enter your name</h2>
      </div>
      <div class="w-full py-4">
        <app-register-name-form
          [initiateFirstName]="initiateFirstName"
          [initiateLastName]="initiateLastName"
          [isLoading]="isLoading"
          (formSubmit)="formSubmitted($event)"
        />
      </div>
    </div>
  `,
})
export class RegisterNameComponent {
  initiateFirstName = '';
  initiateLastName = '';
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    const queryParams = this.route.snapshot.queryParams;
    this.initiateFirstName = queryParams['firstName'] ?? '';
    this.initiateLastName = queryParams['lastName'] ?? '';
  }

  async formSubmitted({ firstName, lastName }: RegisterNameFormSubmmittedEvent) {
    this.isLoading = true;
    setTimeout(() => {
      this.router.navigate(['register', 'steps', 'email'], {
        queryParamsHandling: 'merge',
        queryParams: { firstName, lastName },
      });
      this.isLoading = false;
    }, 500);
  }
}
