import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DomainService } from '@ebizbase/angular-common-service';

@Component({
  selector: 'cmui-full-color-logo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: '<img [src]="src" alt="ebizbase logo" />',
})
export class FullColorLogoComponent {
  readonly src: string;
  constructor(public domain: DomainService) {
    this.src = `${this.domain.StaticAssetsBaseURL}/logo/full_color/full-color-logo.svg`;
  }
}
