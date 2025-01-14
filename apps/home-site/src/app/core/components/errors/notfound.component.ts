import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'home-not-found-error',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="bg-white dark:bg-gray-900">
      <div
        class="grid max-w-screen-xl px-4 pt-20 pb-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12 lg:pt-28"
      >
        <p>Not FOUND</p>
      </div>
    </section>
  `,
})
export class NotFoundErrorComponent {}
