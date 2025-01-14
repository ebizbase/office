import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-full-color-logo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: '<img src="/logo/digital/full_color/full-color-logo.svg" alt="ebizbase logo" />',
})
export class FullColorLogoComponent {}
