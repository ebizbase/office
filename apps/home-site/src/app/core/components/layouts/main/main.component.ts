import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutMainHeaderComponent } from './header/header.component';
import { LayoutMainFooterComponent } from './footer/footer.component';
@Component({
  selector: 'app-layout-main',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutMainHeaderComponent, LayoutMainFooterComponent],
  template: `
    <app-layout-main-header />
    <router-outlet></router-outlet>
    <app-layout-main-footer />
  `,
})
export class LayoutMainComponent {}
