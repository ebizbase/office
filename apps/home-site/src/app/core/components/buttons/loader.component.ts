import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TuiButton, TuiLoader } from '@taiga-ui/core';

@Component({
  selector: 'app-loader-button',
  imports: [TuiButton, TuiLoader],
  template: `
    <tui-loader class="loader" [overlay]="loadingOverlay" [showLoader]="isLoading">
      <button
        tuiButton
        class="w-full"
        [appearance]="appearance"
        [disabled]="isDisabled"
        [size]="size"
      >
        <ng-content />
      </button>
    </tui-loader>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderButtonComponent {
  @Input() appearance: 'primary' | 'accent' | 'secondary' | 'flat' | 'outline' = 'primary';
  @Input() size: 'xs' | 's' | 'm' | 'l' = 'm';
  @Input() isLoading = false;
  @Input() isDisabled = false;
  @Input() loadingOverlay = true;
}
