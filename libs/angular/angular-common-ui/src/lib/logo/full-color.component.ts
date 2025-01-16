import { DomainService } from '@ebizbase/angular-common-service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'cmui-full-color-logo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template:
    '<img src="{{domain.StaticAssetDomain}}/logo/full_color/full-color-logo.svg" alt="ebizbase logo" />',
})
export class FullColorLogoComponent {
  constructor(public domain: DomainService) {}
}
