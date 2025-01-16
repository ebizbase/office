import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NameRegisterFormComponent,
  NameRegisterFormSubmmittedEvent,
} from '../core/components/forms/name.component';

@Component({
  selector: 'app-name-register-page',
  standalone: true,
  imports: [CommonModule, NameRegisterFormComponent],
  template: `
    <div class="flex flex-col md:flex-row">
      <div class="w-full">
        <h1 class="text-xl md:text-3xl font-semibold leading-tight w-full mb-4">
          Welcome to eBizBase
        </h1>
        <h2 class="md:text-lg leading-tight w-full">Enter your name</h2>
      </div>
      <div class="w-full">
        <app-name-register-form
          [initiateFirstName]="initiateFirstName"
          [initiateLastName]="initiateLastName"
          [isLoading]="isLoading"
          (formSubmit)="formSubmitted($event)"
        />
      </div>
    </div>
  `,
})
export class IdentifyNamePageComponent {
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

  async formSubmitted({ firstName, lastName }: NameRegisterFormSubmmittedEvent) {
    this.isLoading = true;
    setTimeout(() => {
      this.router.navigate(['register', 'credentials'], {
        queryParamsHandling: 'merge',
        queryParams: { firstName, lastName },
      });
      this.isLoading = false;
    }, 500);
  }
}
