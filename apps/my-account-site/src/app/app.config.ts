import { DomainService } from '@ebizbase/angular-common-service';
import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from '@angular/platform-browser';
import { NG_EVENT_PLUGINS } from '@taiga-ui/event-plugins';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { tuiIconResolverProvider } from '@taiga-ui/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    provideHttpClient(withFetch()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    tuiIconResolverProvider((icon) => {
      const { StaticAssetDomain } = inject(DomainService);
      return icon.includes('/') ? icon : `${StaticAssetDomain}/icons/${icon}.svg`;
    }),
    provideRouter(appRoutes),
    provideAnimations(),
    NG_EVENT_PLUGINS,
  ],
};
