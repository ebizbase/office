import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignInFormComponent, SignInFormSubmitEvent } from './sign-in-form.component';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'home-sign-in',
  standalone: true,
  imports: [CommonModule, SignInFormComponent, RouterModule],
  template: `
    <h1 class="text-xl md:text-2xl font-bold leading-tight w-full text-center mb-6">Sign In</h1>
    <home-sign-in-form [isLoading]="isLoading" (onSubmit)="onSubmit($event)" />
    <p class="flex mt-12 w-full justify-center">
      Don't have an account ?
      <a routerLink="/sign-up" class="text-blue-500 hover:text-blue-700 font-semibold ml-1">
        Sign up here
      </a>
    </p>
  `,
})
export class SignInComponent {
  isLoading = false;

  @ViewChild(SignInFormComponent) signInFormComponent!: SignInFormComponent;

  async onSubmit({ email, password }: SignInFormSubmitEvent) {
    console.log('Credentials', { email, password });
    this.isLoading = true;

    // Giả lập gọi API
    setTimeout(() => {
      // Ví dụ phản hồi từ server với lỗi email
      const serverResponse = {
        errors: {
          email: 'This email is already registered.',
          password: 'This password is not strong',
        },
      };

      // Thiết lập lỗi server vào form control
      const childComponent = this.signInFormComponent;
      childComponent.setServerErrors(serverResponse.errors);

      this.isLoading = false;
    }, 2000);
  }
}
