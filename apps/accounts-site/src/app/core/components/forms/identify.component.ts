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
import { LoaderButtonComponent } from '@ebizbase/angular-common-ui';

export interface IdentifyFormSubmmittedEvent {
  email: string;
}

@Component({
  selector: 'app-identify-form',
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
      <tui-textfield iconStart="@tui.mail">
        <label tuiLabel for="email">Email</label>
        <input
          tuiTextfield
          type="email"
          formControlName="email"
          autocomplete="email"
          [invalid]="email.touched && email.invalid"
        />
      </tui-textfield>

      <div class="flex gap-2 justify-end mt-8 ">
        <cmui-loader-button (click)="onSubmitEvent()" [isLoading]="isLoading">
          {{ labels.submitButton }}
        </cmui-loader-button>
      </div>
    </form>
  `,
})
export class IdentifyFormComponent {
  @Input() isLoading = false;
  @Output() formSubmit = new EventEmitter<IdentifyFormSubmmittedEvent>();

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
        Validators.pattern(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/),
      ],
    }),
  });

  get email() {
    return this.form.get('email');
  }

  onSubmitEvent() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value as IdentifyFormSubmmittedEvent);
    }
  }
}
