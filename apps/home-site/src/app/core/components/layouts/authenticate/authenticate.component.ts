import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FullColorLogoComponent } from '../../logo/full-color.component';
@Component({
  selector: 'app-layout-authenticate',
  standalone: true,
  imports: [CommonModule, RouterModule, FullColorLogoComponent],
  template: `
    <div class="bg-gray-50 font-[sans-serif] text-[#333]">
      <div class="min-h-screen flex flex-col items-center justify-center py-6 px-4">
        <header class="mb-12">
          <app-full-color-logo class="h-12" />
        </header>
        <main class="max-w-4xl w-full border py-12 px-6 rounded-3xl border-gray-300 bg-white">
          <router-outlet></router-outlet>
        </main>
        <footer class="flex max-w-4xl w-full justify-between">
          <div>
            <p class="text-sm text-gray-500">&copy; 2023 eBizBase - All Rights Reserved.</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">&copy; 2023 eBizBase - All Rights Reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  `,
})
export class LayoutAuthenticateComponent {}
