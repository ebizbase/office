import { Dict } from '@ebizbase/common-types';
import { Directive, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Directive()
export abstract class FormBaseComponent<T extends object = object> {
  // Form group
  form!: FormGroup;

  // Loading state
  isLoading = false;

  // Event emitter để submit data
  @Output() formSubmit = new EventEmitter<T>();

  // Phương thức kiểm tra trạng thái hợp lệ của control
  isControlInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  // Phương thức xử lý lỗi từ server
  setServerErrors(errors: Dict<string>) {
    Object.keys(errors).forEach((key) => {
      const control = this.form.get(key);
      if (control) {
        control.setErrors({ server: errors[key] });
      }
    });
  }

  // Phương thức xóa lỗi server
  clearServerError(controlName: string) {
    const control = this.form.get(controlName);
    if (control && control.errors && control.errors['server']) {
      delete control.errors['server'];
      control.setErrors(control.errors);
    }
  }

  // Submit form
  onSubmitEvent() {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
    }
  }
}
