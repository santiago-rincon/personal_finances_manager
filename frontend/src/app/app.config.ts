import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import {
  BrowserAnimationsModule,
  provideAnimations,
} from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideAnimations(),
    provideHttpClient(withFetch()),
    importProvidersFrom([BrowserAnimationsModule, BrowserModule]),
  ],
};

