import { Route } from '@angular/router';
import { LayoutMainComponent } from './core/components/layouts/main/main.component';
export const appRoutes: Route[] = [
  {
    path: '',
    component: LayoutMainComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home-page.component').then((c) => c.HomePageComponent),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/not-found-page.component').then((c) => c.NotFoundPageComponent),
      },
    ],
  },
];
