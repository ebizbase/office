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

export interface SignInFormSubmitEvent {
  otp: string;
}

@Component({
  selector: 'app-sign-in-form',
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
  styles: [
    `
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        /* display: none; <- Crashes Chrome on hover */
        -webkit-appearance: none;
        margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
      }

      input[type='number'] {
        -moz-appearance: textfield; /* Firefox */
      }
    `,
  ],
  template: `
    <form class="flex flex-col gap-2" [formGroup]="form">
      <tui-textfield>
        <label tuiLabel for="otp">OTP</label>
        <input
          tuiTextfield
          type="number"
          formControlName="otp"
          [invalid]="isControlInvalid('otp')"
        />
      </tui-textfield>
      <div class="flex gap-2 justify-end mt-8 ">
        <app-loader-button
          (click)="onSubmitEvent()"
          [isDisabled]="!form.valid"
          [isLoading]="isLoading"
        >
          {{ labels.submitButton }}
        </app-loader-button>
      </div>
    </form>
  `,
})
export class SignInFormComponent {
  @Input() isLoading = false;
  @Output() formSubmit = new EventEmitter<SignInFormSubmitEvent>();

  readonly labels = {
    submitButton: 'Next',
  };

  readonly errorMessages: Dict<Dict<string>> = {
    otp: {
      required: 'Please enter your email address!',
      pattern: 'Please enter a valid email address!',
    },
  };

  form = new FormGroup({
    otp: new FormControl('', {
      validators: [Validators.required],
    }),
  });

  isControlInvalid(control: string) {
    return this.form.get(control).valid;
  }

  onSubmitEvent() {
    this.formSubmit.emit(this.form.value as SignInFormSubmitEvent);
  }
}
