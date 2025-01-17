import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoaderButtonComponent } from '@ebizbase/angular-common-ui';
import { Dict } from '@ebizbase/common-types';
import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { IamService } from '../../services/iam.service';

export interface OtpVerifyFormSubmitEvent {
  otp: string;
}

@Component({
  selector: 'app-otp-verify-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiTextfield,
    TuiButton,
    TuiIcon,
    RouterModule,
    LoaderButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type='number'] {
        -moz-appearance: textfield;
      }
    `,
  ],
  template: `
    <form class="flex flex-col gap-2" [formGroup]="form">
      <tui-textfield iconStart="@tui.mail">
        <label tuiLabel for="email">Email</label>
        <input tuiTextfield type="email" />
      </tui-textfield>

      <tui-textfield iconStart="@tui.key">
        <label tuiLabel for="email">OTP</label>
        <input
          tuiTextfield
          type="number"
          formControlName="otp"
          [invalid]="isControlInvalid('otp')"
        />
        <button tuiButton appearance="flat" size="s" (click)="onGetOtp()">
          <ng-container *ngIf="isResendOtpAvaiable; else getOtpCountDown">
            <span *ngIf="getOtpFirstTime"> Get OTP </span>
            <span *ngIf="!getOtpFirstTime"> Resend OTP </span>
          </ng-container>
          <ng-template #getOtpCountDown>
            {{ this.getOtpCountDown }}
            <tui-icon [icon]="clockIcon" />
          </ng-template>
        </button>
      </tui-textfield>

      <div class="flex gap-2 justify-end mt-8 ">
        <cmui-loader-button (click)="onSubmitEvent()" [isLoading]="isLoading">
          Next
        </cmui-loader-button>
      </div>
    </form>
  `,
})
export class OtpVerifyFormComponent {
  @Input() email: string;
  @Input() isLoading = false;
  @Output() formSubmit = new EventEmitter<OtpVerifyFormSubmitEvent>();

  constructor(private iamService: IamService) {}

  getOtpFirstTime = true;
  getOtpCountDown = 0;

  clockIcons = [
    '@tui.clock',
    '@tui.clock-1',
    '@tui.clock-2',
    '@tui.clock-3',
    '@tui.clock-4',
    '@tui.clock-5',
    '@tui.clock-6',
    '@tui.clock-7',
    '@tui.clock-8',
    '@tui.clock-9',
  ];

  readonly errorMessages: Dict<Dict<string>> = {
    otp: {
      required: 'Please enter OTP code!',
      minLength: 'The OTP code is invalid!',
    },
  };

  form = new FormGroup({
    otp: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
    }),
  });

  get isResendOtpAvaiable() {
    return this.getOtpCountDown === 0;
  }

  get clockIcon() {
    return this.clockIcons[this.getOtpCountDown % this.clockIcons.length];
  }

  countDownGetOtp() {
    const countdown = () => {
      this.getOtpCountDown = this.getOtpCountDown - 1;
      if (this.getOtpCountDown > 0) {
        setTimeout(countdown, 1000);
      }
    };
    countdown();
  }

  isControlInvalid(controlName: string) {
    const control = this.form.get(controlName);
    return control.touched && !control.valid;
  }

  onSubmitEvent() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value as OtpVerifyFormSubmitEvent);
    }
  }

  onGetOtp() {
    this.getOtpFirstTime = false;
    this.getOtpCountDown = 30;
    this.iamService.getOtp({ email: this.email }).subscribe({
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
    this.countDownGetOtp();
  }
}
