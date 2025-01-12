import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TuiButton, TuiLoader } from '@taiga-ui/core';

@Component({
  selector: 'ui-form-submit-button',
  imports: [TuiButton, TuiLoader],
  template: `
    <tui-loader class="loader" [overlay]="true" [showLoader]="isLoading">
      <button tuiButton class="w-full" [disabled]="isDisabled">
        {{ label }}
      </button>
    </tui-loader>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSubmitButtonComponent {
  @Input() label = 'Submit'; // Label hiển thị trên nút
  @Input() isLoading = false; // Trạng thái loading
  @Input() isDisabled = false; // Trạng thái disable nút
}
