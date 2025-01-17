import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-gray-50 font-[sans-serif] text-[#333]">
      <div class="min-h-screen flex flex-col items-center justify-center py-6 px-4">
        <main
          class="max-w-4xl w-full py-12 px-6 md:border md:rounded-3xl md:border-gray-300 md:bg-white md:min-h-80"
        >
          <router-outlet></router-outlet>
        </main>
        <footer class="flex max-w-4xl w-full justify-between mt-6">
          <div>
            <p class="text-sm text-gray-500"></p>
          </div>
          <ul class="flex space-x-6">
            <li class="text-sm text-gray-500"><a href="#">Help</a></li>
            <li class="text-sm text-gray-500"><a href="#">Privacy</a></li>
            <li class="text-sm text-gray-500"><a href="#">Terms</a></li>
          </ul>
        </footer>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {}
