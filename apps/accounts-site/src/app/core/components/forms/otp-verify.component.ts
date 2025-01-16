import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TuiTextfield } from '@taiga-ui/core';
import { LoaderButtonComponent } from '@ebizbase/angular-common-ui';

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
    RouterModule,
    LoaderButtonComponent,
  ],
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
    <form class="flex flex-col gap-2">
      <div class="flex gap-2 justify-center w-full">
        <tui-textfield
          *ngFor="let i of [0, 1, 2, 3, 4, 5]"
          [tuiTextfieldCleaner]="false"
          class="min-w-12"
        >
          <input
            class="text-center font-semibold"
            tuiTextfield
            type="number"
            [id]="'otp-' + i"
            [name]="'otp-' + i"
            [(ngModel)]="otp[i]"
            (input)="onInputChange($event, i)"
            (keydown)="onKeyDown($event, i)"
            (paste)="onPaste($event)"
          />
        </tui-textfield>
      </div>
      <div class="flex gap-2 justify-between mt-8 ">
        <cmui-loader-button
          (click)="onResendOTPEvent()"
          appearance="flat"
          [isDisabled]="resendOtpCountDown > 1"
          [isLoading]="isLoading"
        >
          Resend OTP
          <ng-container *ngIf="resendOtpCountDown > 1">({{ resendOtpCountDown }}s)</ng-container>
        </cmui-loader-button>
        <cmui-loader-button (click)="onSubmitEvent()" [isLoading]="isLoading">
          {{ labels.submitButton }}
        </cmui-loader-button>
      </div>
    </form>
  `,
})
export class OtpVerifyFormComponent implements OnInit {
  @Input() isLoading = false;
  @Output() formSubmit = new EventEmitter<OtpVerifyFormSubmitEvent>();

  readonly labels = {
    submitButton: 'Next',
  };

  resendOtpCountDown = 10;

  @Output() otpChange = new EventEmitter<string>(); // Event xuất giá trị OTP
  otp = new Array(6).fill(''); // Lưu giá trị OTP thực tế

  constructor(@Inject(PLATFORM_ID) private platformId: unknown) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.countDownResendOtp();
    }
  }

  countDownResendOtp() {
    const countdown = () => {
      this.resendOtpCountDown = this.resendOtpCountDown - 1;
      if (this.resendOtpCountDown > 0) {
        setTimeout(countdown, 1000); // Gọi lại hàm sau 1 giây
      }
    };
    this.resendOtpCountDown = 10;
    countdown();
  }

  onInputChange(event: Event, index: number) {
    console.log(index);
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value.length > 1) {
      input.value = '' + input.value.slice(-1);
    }
    this.focusNext(index);
    this.emitOtpValue();
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const key = event.key;
    if (key === 'Backspace' && index > 0 && !this.otp[index]) {
      this.focusPrevious(index);
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    this.otp = pastedText
      .split('')
      .filter((d) => !isNaN(parseInt(d)))
      .slice(0, 6);
    this.emitOtpValue();
    document.getElementById(`otp-${this.otp.length - 1}`)?.focus();
  }

  private focusNext(index: number) {
    const nextInput = document.getElementById(`otp-${index + 1}`);
    nextInput?.focus();
  }

  private focusPrevious(index: number) {
    const prevInput = document.getElementById(`otp-${index - 1}`);
    prevInput?.focus();
  }

  private emitOtpValue() {
    this.otpChange.emit(this.otp.join(''));
  }

  onSubmitEvent() {
    this.formSubmit.emit({ otp: this.otp.join('') });
  }

  onResendOTPEvent() {
    this.countDownResendOtp();
  }
}
