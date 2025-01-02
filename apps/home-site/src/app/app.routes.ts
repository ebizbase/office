import { Route } from '@angular/router';
import { AuthLayoutComponent } from './core/components/auth-layout.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'sign-in',
        loadComponent: () =>
          import('./features/sign-in/sign-in.component').then((c) => c.SignInComponent),
      },
    ],
  },
  // {
  //   path: '**',
  //   component: NotFoundComponent,
  // },
];
