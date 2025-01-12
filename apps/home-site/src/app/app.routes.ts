import { Route } from '@angular/router';
import { AuthLayoutComponent } from './core/components/auth-layout.component';
import { MainLayoutComponent } from './core/components/main-layout.component';

export const appRoutes: Route[] = [
  {
    path: 'authenticate',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'sign-in',
        loadComponent: () =>
          import('./features/sign-in/sign-in.component').then((c) => c.SignInComponent),
      },
    ],
  },
  {
    path: '**',
    component: MainLayoutComponent,
  },
];
