import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormBaseComponent } from './form-base.component';

class TestFormComponent extends FormBaseComponent<any> {
  constructor() {
    super();
    this.form = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }
}

describe('FormBaseComponent', () => {
  let component: TestFormComponent;

  beforeEach(() => {
    component = new TestFormComponent();
  });

  it('should create the form with controls', () => {
    expect(component.form.contains('username')).toBeTruthy();
    expect(component.form.contains('password')).toBeTruthy();
  });

  it('should return true if control is invalid and dirty or touched', () => {
    const control = component.form.get('username');
    control?.markAsDirty();
    control?.setErrors({ required: true });
    expect(component.isControlInvalid('username')).toBeTruthy();
  });

  it('should return false if control is valid', () => {
    const control = component.form.get('username');
    control?.setValue('test');
    expect(component.isControlInvalid('username')).toBeFalsy();
  });

  it('should set server errors on controls', () => {
    component.setServerErrors({ username: 'Server error' });
    const control = component.form.get('username');
    expect(control?.errors).toEqual({ server: 'Server error' });
  });

  it('should clear server error from control', () => {
    const control = component.form.get('username');
    control?.setErrors({ server: 'Server error', required: true });
    component.clearServerError('username');
    expect(control?.errors).toEqual({ required: true });
  });

  it('should emit form value on submit if form is valid', () => {
    jest.spyOn(component.formSubmit, 'emit');
    component.form.setValue({ username: 'test', password: 'test' });
    component.onSubmitEvent();
    expect(component.formSubmit.emit).toHaveBeenCalledWith({ username: 'test', password: 'test' });
  });

  it('should not emit form value on submit if form is invalid', () => {
    jest.spyOn(component.formSubmit, 'emit');
    component.form.setValue({ username: '', password: '' });
    component.onSubmitEvent();
    expect(component.formSubmit.emit).not.toHaveBeenCalled();
  });
});
