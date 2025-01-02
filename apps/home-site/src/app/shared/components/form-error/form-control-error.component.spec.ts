import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormErrorComponent, FormControlErrorDict } from './form-control-error.component';
import { CommonModule } from '@angular/common';

describe('FormControlErrorComponent', () => {
  let component: FormErrorComponent;
  let fixture: ComponentFixture<FormErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule, FormsModule, FormErrorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormErrorComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display no errors when control is pristine', () => {
    component.control = new FormControl('');
    component.errorsDict = { required: 'This field is required' };
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.text-danger');
    expect(errorMessage).toBeNull();
  });

  it('should display an error when control is dirty and has errors', () => {
    const control = new FormControl('');
    control.markAsDirty();
    control.setErrors({ required: true, email: true });

    component.control = control;
    component.errorsDict = {
      required: 'This field is required',
      email: 'Please enter valid email',
    };
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.text-danger');
    expect(errorMessage).not.toBeNull();
    expect(errorMessage.textContent).toContain('This field is required');
    expect(errorMessage.textContent).toContain('Please enter valid email');
  });

  it('should display only the first error when displayFirstErrorOnly is true', () => {
    const control = new FormControl('');
    control.markAsDirty();
    control.setErrors({ required: true, minlength: true });

    const errorsDict: FormControlErrorDict = {
      required: 'This field is required',
      minlength: 'Minimum length is 5',
    };

    component.control = control;
    component.errorsDict = errorsDict;
    component.displayFirstErrorOnly = true;
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.text-danger');
    expect(errorMessage).not.toBeNull();
    expect(errorMessage.textContent).toContain('This field is required');
    expect(errorMessage.textContent).not.toContain('Minimum length is 5');
  });

  it('should display all errors when displayFirstErrorOnly is false', () => {
    const control = new FormControl('');
    control.markAsDirty();
    control.setErrors({ required: true, minlength: true });

    const errorsDict: FormControlErrorDict = {
      required: 'This field is required',
      minlength: 'Minimum length is 5',
    };

    component.control = control;
    component.errorsDict = errorsDict;
    component.displayFirstErrorOnly = false;
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.text-danger');
    expect(errorMessage).not.toBeNull();
    expect(errorMessage.textContent).toContain('This field is required');
    expect(errorMessage.textContent).toContain('Minimum length is 5');
  });
});
