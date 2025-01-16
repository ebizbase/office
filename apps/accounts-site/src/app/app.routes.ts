import { Route } from '@angular/router';
import { MainLayoutComponent } from './core/components/layouts/main/main.component';
export const appRoutes: Route[] = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '/identify',
      },
      {
        path: 'identify',
        loadComponent: () =>
          import('./pages/identify.component').then((c) => c.IdentifyPageComponent),
      },
      {
        path: 'verify-otp',
        loadComponent: () =>
          import('./pages/verify-otp.component').then((c) => c.VerifyOTPPageComponent),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/not-found-page.component').then((c) => c.NotFoundPageComponent),
      },
    ],
  },
];
