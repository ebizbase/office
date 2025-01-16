import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
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

export interface NameRegisterFormSubmmittedEvent {
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-name-register-form',
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
    <form class="flex flex-col space-y-4" [formGroup]="form">
      <div class="flex flex-col space-y-4">
        <tui-textfield>
          <label tuiLabel for="firstName">{{ labels.firstName }}</label>
          <input
            tuiTextfield
            formControlName="firstName"
            [invalid]="isControlInvalid('firstName')"
          />
        </tui-textfield>
        <tui-textfield>
          <label tuiLabel for="lastName">{{ labels.lastName }}</label>
          <input tuiTextfield formControlName="lastName" [invalid]="isControlInvalid('lastName')" />
        </tui-textfield>
      </div>
      <div class="flex gap-2 justify-end pt-8">
        <cmui-loader-button
          (click)="onSubmitEvent()"
          [isDisabled]="!form.valid"
          [isLoading]="isLoading"
        >
          {{ labels.submitButton }}
        </cmui-loader-button>
      </div>
    </form>
  `,
})
export class NameRegisterFormComponent implements OnInit {
  @Input() isLoading = false;
  @Input() initiateFirstName = '';
  @Input() initiateLastName = '';
  @Output() formSubmit = new EventEmitter<NameRegisterFormSubmmittedEvent>();

  readonly errorMessages: Dict<Dict<string>> = {
    email: {
      required: 'Please enter your email address!',
      pattern: 'Please enter a valid email address!',
    },
  };

  form = new FormGroup({
    firstName: new FormControl(this.initiateFirstName, {
      validators: [Validators.required],
    }),
    lastName: new FormControl(this.initiateLastName),
  });

  readonly labels = {
    firstName: 'First Name',
    lastName: 'Last name (Optional)',
    submitButton: 'Next',
  };
  constructor() {
    console.log({
      initiateFirstName: this.initiateFirstName,
      initiateLastName: this.initiateLastName,
    });
  }

  ngOnInit(): void {
    this.form.get('firstName').setValue(this.initiateFirstName);
    this.form.get('lastName').setValue(this.initiateLastName);
  }

  isControlInvalid(controlName: string) {
    const control = this.form.get(controlName);
    return control.touched && !control.valid;
  }

  onSubmitEvent() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value as NameRegisterFormSubmmittedEvent);
    }
  }
}
