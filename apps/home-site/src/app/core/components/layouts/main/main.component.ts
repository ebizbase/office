import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutMainHeaderComponent } from './header/header.component';
import { LayoutMainFooterComponent } from './footer/footer.component';
@Component({
  selector: 'home-layout-main',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutMainHeaderComponent, LayoutMainFooterComponent],
  template: `
    <home-layout-main-header />
    <router-outlet></router-outlet>
    <home-layout-main-footer />
  `,
})
export class LayoutMainComponent {}
