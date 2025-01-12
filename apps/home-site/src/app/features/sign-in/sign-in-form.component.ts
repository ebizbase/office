import { TuiTooltip } from '@taiga-ui/kit';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  FormsModule,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormBaseComponent, FormErrorComponent, FormSubmitButtonComponent } from '@ebizbase/ng-ui';
import { TuiIcon, TuiTextfield } from '@taiga-ui/core';

export interface SignInFormSubmitEvent {
  email: string;
  password: string;
}

@Component({
  selector: 'home-sign-in-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiTextfield,
    TuiIcon,
    TuiTooltip,
    FormErrorComponent,
    FormSubmitButtonComponent,
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <form class="space-y-4" [formGroup]="form">
      <!-- Email field -->
      <div class="flex flex-col gap-2">
        <tui-textfield iconStart="@tui.mail">
          <label tuiLabel for="email">Email</label>
          <span class="tui-required"></span>
          <input
            type="email"
            tuiTextfield
            formControlName="email"
            autocomplete="email"
            [invalid]="isControlInvalid('email')"
          />
        </tui-textfield>
        <ui-form-error [control]="form.get('email')!" [errorsDict]="errorMessages['email']" />
      </div>

      <!-- Password field -->
      <div class="flex flex-col gap-2">
        <tui-textfield iconStart="@tui.lock">
          <label tuiLabel for="password">Password</label>
          <span class="tui-required"></span>
          <input
            [type]="showPassword ? 'text' : 'password'"
            tuiTextfield
            formControlName="password"
            autocomplete="new-password"
            [invalid]="isControlInvalid('password')"
          />
          <tui-icon
            [tuiTooltip]="
              showPassword ? labels['hidePasswordTooltip'] : labels['showPasswordTooltip']
            "
            [icon]="showPassword ? '@tui.eye-off' : '@tui.eye'"
            (click)="toogleShowPassword()"
          />
        </tui-textfield>
        <ui-form-error [control]="form.get('password')!" [errorsDict]="errorMessages['password']" />
        <div class="flex justify-end">
          <a routerLink="/recovery" class="text-blue-500 hover:text-blue-700 font-semibold ml-1"
            >Forgot password?</a
          >
        </div>
      </div>
    </form>
    <ui-form-submit-button
      class="mt-6"
      [label]="labels.submitButton"
      [isDisabled]="!form.valid || isLoading"
      [isLoading]="isLoading"
      (click)="onSubmitEvent()"
    />
  `,
})
export class SignInFormComponent extends FormBaseComponent<SignInFormSubmitEvent> {
  @Input() override isLoading = false;

  labels = {
    otp: 'OTP',
    showPasswordTooltip: 'Show password',
    hidePasswordTooltip: 'Hide password',
    submitButton: 'Sign In',
  };

  showPassword = false;

  override form = new FormGroup({
    email: new FormControl('', {
      validators: [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ],
    }),
    password: new FormControl('', {
      validators: [
        Validators.required,
        Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/),
      ],
    }),
  });

  // Error messages for validation, including server errors
  errorMessages: { [key: string]: { [key: string]: string } } = {
    email: {
      required: 'Please enter your email address!',
      pattern: 'Please enter a valid email address!',
    },
    password: {
      required: 'Please enter your password!',
      pattern:
        'Password must be at least eight characters, at least one uppercase letter, one lowercase letter, one number and one special character!',
    },
  };

  constructor() {
    super();
    this.form.get('email')?.valueChanges.subscribe(() => {
      this.clearServerError('email');
    });
    this.form.get('password')?.valueChanges.subscribe(() => {
      this.clearServerError('password');
    });
  }

  toogleShowPassword() {
    this.showPassword = !this.showPassword;
  }
}
