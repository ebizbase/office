import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularCommonUiComponent } from './angular-common-ui.component';

describe('AngularCommonUiComponent', () => {
  let component: AngularCommonUiComponent;
  let fixture: ComponentFixture<AngularCommonUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AngularCommonUiComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AngularCommonUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
