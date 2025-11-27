import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './app/service/auth.interceptor';
import { StorageService } from './app/service/storage.service';
import { provideStorage, Storage } from '@ionic/storage-angular';
import { PLATFORM_ID } from '@angular/core';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptorsFromDi()),
    // Proveedor de Ionic Storage (necesario para inyectar `Storage`)
    {
      provide: Storage,
      useFactory: (platformId: Object) => provideStorage(platformId, { name: '__espacios_db' }),
      deps: [PLATFORM_ID]
    },
    // Registra el interceptor de autenticación
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    // Asegura que StorageService se inicialice
    StorageService
  ],
});
