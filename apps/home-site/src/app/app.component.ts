import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TuiRoot } from '@taiga-ui/core';

@Component({
  standalone: true,
  imports: [TuiRoot, RouterModule],
  selector: 'app',
  template: `
    <tui-root>
      <router-outlet></router-outlet>
      <ng-container ngProjectAs="tuiOverContent"></ng-container>
      <ng-container ngProjectAs="tuiOverDialogs"></ng-container>
      <ng-container ngProjectAs="tuiOverAlerts"></ng-container>
      <ng-container ngProjectAs="tuiOverDropdowns"></ng-container>
      <ng-container ngProjectAs="tuiOverHints"></ng-container>
    </tui-root>
  `,
})
export class AppComponent {}
