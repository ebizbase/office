import { Component, Inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthenticateService, DomainService } from '@ebizbase/angular-common-service';
import { WA_WINDOW } from '@ng-web-apis/common';
import { TuiRoot } from '@taiga-ui/core';

@Component({
  standalone: true,
  imports: [TuiRoot, RouterModule],
  selector: 'app-root',
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
export class AppComponent implements OnInit {


  constructor(
    private domain: DomainService,
    private authenticate: AuthenticateService,
    @Inject(WA_WINDOW) private window: Window,
  ) { }

  ngOnInit(): void {
    if (!this.authenticate.isLoggedIn) {
      this.window.location.href = `${this.domain.AccountsSiteDomain}/identify?continue=${this.domain.MyAccountSiteDomain}`;
    }
  }

}
