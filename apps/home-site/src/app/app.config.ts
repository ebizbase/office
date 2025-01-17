import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { DomainService } from '@ebizbase/angular-common-service';
import { TUI_ICON_RESOLVER } from '@taiga-ui/core';
import { NG_EVENT_PLUGINS } from '@taiga-ui/event-plugins';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    provideHttpClient(withFetch()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    {
      provide: TUI_ICON_RESOLVER,
      deps: [DomainService],
      useFactory({ StaticAssetsBaseURL }: DomainService) {
        return (name: string) => {
          return name.startsWith('@tui.')
            ? `${StaticAssetsBaseURL}/icons/${name.slice(5)}.svg`
            : name;
        };
      },
    },
    provideRouter(appRoutes),
    provideAnimations(),
    NG_EVENT_PLUGINS,
  ],
};
