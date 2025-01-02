import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormsModule,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TuiButton } from '@taiga-ui/core';
import { TuiIcon, TuiTextfield, TuiLoader } from '@taiga-ui/core';
import { CommonModule } from '@angular/common';
import { TuiTooltip } from '@taiga-ui/kit';
import { RouterModule } from '@angular/router';
import { FormErrorComponent } from '../../shared/components/form-error/form-control-error.component';

@Component({
  selector: 'home-sign-in-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiButton,
    TuiLoader,
    TuiIcon,
    TuiTooltip,
    TuiTextfield,
    FormErrorComponent,
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `
    <form class="space-y-4" [formGroup]="signUpForm">
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
        <home-form-error
          [control]="signUpForm.get('email')!"
          [errorsDict]="errorMessages['email']"
        />
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
            [tuiTooltip]="showPassword ? hidePasswordTooltip : showPasswordTooltip"
            [icon]="showPassword ? '@tui.eye-off' : '@tui.eye'"
            (click)="toogleShowPassword()"
          />
        </tui-textfield>
        <home-form-error
          [control]="signUpForm.get('password')!"
          [errorsDict]="errorMessages['password']"
        />
        <div class="flex justify-end">
          <a routerLink="/recovery" class="text-blue-500 hover:text-blue-700 font-semibold ml-1"
            >Forgot password?</a
          >
        </div>
      </div>
    </form>
    <div class="mt-6">
      <!-- Submit button -->
      <tui-loader class="loader" [overlay]="true" [showLoader]="isLoading">
        <button
          class="w-full"
          tuiButton
          (click)="onSubmit()"
          [disabled]="!signUpForm.valid || isLoading"
        >
          Sign In
        </button>
      </tui-loader>
    </div>
  `,
})
export class SignInFormComponent {
  @Input() isLoading = false;

  @Output() signIn: EventEmitter<{ email: string; password: string }> = new EventEmitter();

  showPassword = false;
  showPasswordTooltip = 'Show password';
  hidePasswordTooltip = 'Hide password';

  signUpForm = new FormGroup({
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
    // Clear server errors when email or password field is changed
    this.signUpForm.get('email')?.valueChanges.subscribe(() => {
      this.clearServerError('email');
    });

    this.signUpForm.get('password')?.valueChanges.subscribe(() => {
      this.clearServerError('password');
    });
  }

  // Emit the form data when the form is submitted
  onSubmit() {
    if (this.signUpForm.valid) {
      const { email, password } = this.signUpForm.value as { email: string; password: string };
      this.signIn.emit({ email, password });
    }
  }

  // Method to set server errors for form controls using server response
  setServerErrors(serverErrorResponse: { errors: { [key: string]: string } }) {
    const errors = serverErrorResponse.errors;

    // Check if there's an error for the email field
    if (errors['email']) {
      this.errorMessages['email']['server'] = errors['email'];
      this.signUpForm.get('email')?.setErrors({ server: true });
    }

    // Check if there's an error for the password field
    if (errors['password']) {
      this.errorMessages['password']['server'] = errors['password'];
      this.signUpForm.get('password')?.setErrors({ server: true });
    }
  }

  // Method to clear server errors when user modifies the email or password field
  clearServerError(fieldName: 'email' | 'password') {
    this.errorMessages[fieldName]['server'] = '';
    const control = this.signUpForm.get(fieldName);

    if (control) {
      // Get current errors
      const currentErrors = control.errors;

      // If there are errors, filter out the 'server' error and update errors
      if (currentErrors) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { server, ...otherErrors } = currentErrors;
        control.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
      }
    }
  }

  toogleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  isControlInvalid(name: string) {
    const control = this.signUpForm.get(name);
    return control && control.errors && (control.dirty || control.touched);
  }
}
