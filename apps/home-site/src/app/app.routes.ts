import { Route, Router } from '@angular/router';
import { LayoutAuthenticateComponent } from './core/components/layouts/authenticate/authenticate.component';
import { LayoutMainComponent } from './core/components/layouts/main/main.component';
import { inject } from '@angular/core';
import { AccessTokenService } from './core/services/access-token.service';
export const appRoutes: Route[] = [
  {
    path: 'register',
    component: LayoutAuthenticateComponent,
    canActivate: [
      () => {
        const accessTokenService = inject(AccessTokenService);
        const router = inject(Router);
        if (accessTokenService.isLoggedIn) {
          return router.createUrlTree(['route-to-fallback-page']);
        }
        return true;
      },
    ],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '/register/steps/name',
      },
      {
        path: 'steps/name',
        loadComponent: () =>
          import('./features/register/register-name.component').then(
            (c) => c.RegisterNameComponent
          ),
      },
      {
        path: 'steps/email',
        loadComponent: () =>
          import('./features/register/register-email.component').then(
            (c) => c.RegisterEmailComponent
          ),
      },
    ],
  },
  {
    path: 'sign-in',
    component: LayoutAuthenticateComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '/sign-in/steps/email',
      },
      {
        path: 'steps/email',
        loadComponent: () =>
          import('./features/register/register-email.component').then(
            (c) => c.RegisterEmailComponent
          ),
      },
      {
        path: 'steps/verify-otp',
        loadComponent: () =>
          import('./features/sign-in/verify-otp.component').then((c) => c.SignInVerifyOtpComponent),
      },
    ],
  },
  {
    path: '',
    component: LayoutMainComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then((c) => c.HomeComponent),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./core/components/errors/notfound.component').then(
            (c) => c.NotFoundErrorComponent
          ),
      },
    ],
  },
];
