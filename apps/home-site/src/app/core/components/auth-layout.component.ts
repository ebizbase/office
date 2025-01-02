import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'home-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-gray-50 font-[sans-serif] text-[#333]">
      <div class="min-h-screen flex flex-col items-center justify-center py-6 px-4">
        <header class="mb-12">
          <img class="h-12" alt="ebizbase logo" src="/logo.svg" />
        </header>
        <main class="max-w-md w-full border py-12 px-6 rounded-lg border-gray-300 bg-white">
          <router-outlet></router-outlet>
        </main>
        <footer class="mt-12">
          <p class="text-sm text-gray-500">&copy; 2023 Bonsquare - All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
