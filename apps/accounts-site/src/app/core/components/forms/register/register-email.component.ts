import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormsModule,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Dict } from '@ebizbase/common-types';
import { TuiTextfield } from '@taiga-ui/core';
import { LoaderButtonComponent } from '../../buttons/loader.component';

export interface RegisterEmailFormSubmitEvent {
  email: string;
}

@Component({
  selector: 'register-email-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiTextfield,
    RouterModule,
    LoaderButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="flex flex-col gap-2" [formGroup]="form">
      <!-- Email field -->
      <tui-textfield>
        <label tuiLabel for="email">Email</label>
        <input
          tuiTextfield
          type="email"
          formControlName="email"
          autocomplete="email"
          [invalid]="isControlInvalid('email')"
        />
      </tui-textfield>
      <div class="flex gap-2 justify-end mt-8 ">
        <home-loader-button
          (click)="onSubmitEvent()"
          [isDisabled]="!form.valid"
          [isLoading]="isLoading"
        >
          {{ labels.submitButton }}
        </home-loader-button>
      </div>
    </form>
  `,
})
export class RegisterEmailFormComponent {
  @Input() isLoading = false;
  @Output() formSubmit = new EventEmitter<RegisterEmailFormSubmitEvent>();

  readonly labels = {
    submitButton: 'Next',
  };

  readonly errorMessages: Dict<Dict<string>> = {
    email: {
      required: 'Please enter your email address!',
      pattern: 'Please enter a valid email address!',
    },
  };

  form = new FormGroup({
    email: new FormControl('', {
      validators: [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ],
    }),
  });

  isControlInvalid(control: string) {
    return this.form.get(control).valid;
  }

  onSubmitEvent() {
    this.formSubmit.emit(this.form.value as RegisterEmailFormSubmitEvent);
  }
}