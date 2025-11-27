import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

/**
 * AuthInterceptor - Manejo automático de autenticación en peticiones HTTP
 *
 * Responsabilidades:
 * - Añadir Authorization header a todas las peticiones
 * - Manejar errores 401 (Unauthorized)
 * - Realizar refresh automático del token cuando expira
 * - Prevenir múltiples refresh simultáneos (token refresh guard)
 *
 * Flujo:
 * 1. Intercepta petición → agrega Authorization header
 * 2. Si respuesta es 401 → intenta refresh del token
 * 3. Si refresh exitoso → reintenta petición original
 * 4. Si refresh falla → redirige a login
 *
 * Nota: El interceptor evita loops infinitos de refresh usando
 * un BehaviorSubject que actúa como "lock" durante el refresh.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return new Observable((observer) => {
      (async () => {
        try {
          // Agregar token de acceso a la petición si existe
          const clonedRequest = await this.addToken(request);

          next.handle(clonedRequest).pipe(
            catchError((error) => {
              // Si es 401, intentar refresh
              if (error instanceof HttpErrorResponse && error.status === 401) {
                return this.handle401Error(request, next);
              }
              return throwError(() => error);
            })
          ).subscribe({
            next: (event) => observer.next(event),
            error: (error) => observer.error(error),
            complete: () => observer.complete()
          });
        } catch (error) {
          observer.error(error);
        }
      })();
    });
  }

  /**
   * Agrega el Authorization header a la petición.
   * Usa el token de acceso actual.
   */
  private async addToken(request: HttpRequest<any>): Promise<HttpRequest<any>> {
    try {
      const token = await this.authService.getAccessToken();
      
      if (token && !this.isTokenExpired(token)) {
        return request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      return request;
    } catch (error) {
      console.error('Error adding token:', error);
      return request;
    }
  }

  /**
   * Maneja errores 401 - intenta refresh del token.
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshAccessToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.access);

          // Reintenta la petición original con nuevo token
          return next.handle(this.addTokenSync(request, response.access));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          // Si refresh falla, el AuthService ya limpió la sesión
          return throwError(() => error);
        })
      );
    } else {
      // Si ya hay un refresh en curso, espera a que termine
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((token) => {
          return next.handle(this.addTokenSync(request, token));
        })
      );
    }
  }

  /**
   * Agrega token de forma síncrona (para usar dentro del interceptor).
   */
  private addTokenSync(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /**
   * Verifica si un JWT está expirado (análisis básico de claims).
   * Nota: Esta es una verificación básica. En producción, considera usar
   * una librería como `jwt-decode` para mejor manejo.
   *
   * @param token - JWT token
   * @returns true si el token está expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      // Decodificar JWT manualmente (sin usar librerías externas)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return true;
      }

      const decoded = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      // Si exp existe y es menor al tiempo actual, está expirado
      return decoded.exp && decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }
}
