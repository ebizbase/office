import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { DomainService } from '@ebizbase/angular-common-service';
import { tuiIconResolverProvider } from '@taiga-ui/core';
import { NG_EVENT_PLUGINS } from '@taiga-ui/event-plugins';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    provideHttpClient(withFetch()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    tuiIconResolverProvider((icon) => {
      const { StaticAssetsBaseURL } = inject(DomainService);
      return icon.includes('/') ? icon : `${StaticAssetsBaseURL}/icons/${icon}.svg`;
    }),
    provideRouter(appRoutes),
    provideAnimations(),
    NG_EVENT_PLUGINS,
  ],
};
