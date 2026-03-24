import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AnalyticsService } from './core/services/analytics.service';
import { AuthStore } from './core/services/auth-store.service';
import { SeoService } from './core/services/seo.service';

function initializeAuth(authStore: AuthStore) {
  return () => authStore.hydrate();
}

function initializeAnalytics(analyticsService: AnalyticsService) {
  return () => analyticsService.initialize();
}

function initializeSeo(seoService: SeoService) {
  return () => seoService.initialize();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [AuthStore],
      useFactory: initializeAuth
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [AnalyticsService],
      useFactory: initializeAnalytics
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [SeoService],
      useFactory: initializeSeo
    }
  ]
};
