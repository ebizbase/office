import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, AbstractControlDirective, ReactiveFormsModule } from '@angular/forms';

// Type definition for the error dictionary, mapping error keys to error messages.
export type FormControlErrorDict = { [key: string]: string };

@Component({
  selector: 'ui-form-error',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="errorClass" *ngIf="shouldDisplayError">
      <ng-container *ngFor="let errorKey of errorKeysToDisplay">
        {{ errorsDict[errorKey] }}
      </ng-container>
    </div>
  `,
})
export class FormErrorComponent {
  @Input() errorClass = 'text-danger text-xs';

  // Input to receive the control from the FormGroup to extract validation errors.
  @Input() control!: AbstractControl | AbstractControlDirective;

  // Input to receive the dictionary of error messages corresponding to different validation errors.
  @Input() errorsDict: FormControlErrorDict = {};

  // Input to determine whether to display all errors or only the first error.
  @Input() displayFirstErrorOnly = false;

  // Getter to determine if errors should be displayed based on the control's state.
  public get shouldDisplayError() {
    return this.control?.errors && (this.control.dirty || this.control.touched);
  }

  // Getter to filter and return the relevant error keys that exist in control.errors.
  public get relevantErrorKeys(): string[] {
    return this.control.errors
      ? Object.keys(this.errorsDict).filter((key) => this.control.errors?.[key])
      : [];
  }

  // Getter to decide which error keys to display based on displayFirstErrorOnly flag.
  public get errorKeysToDisplay(): string[] {
    const keys = this.relevantErrorKeys;
    return this.displayFirstErrorOnly ? keys.slice(0, 1) : keys;
  }
}
