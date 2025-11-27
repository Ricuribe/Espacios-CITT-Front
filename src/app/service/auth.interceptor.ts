import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, from } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Excluir las rutas de login y registro para evitar bucles
    if (request.url.includes('/token/') || request.url.includes('/login')) {
      return next.handle(request);
    }

    // 1. Convertimos la promesa del token (Storage) en un Observable
    return from(this.authService.getAccessToken()).pipe(
      switchMap(token => {
        let authReq = request;
        if (token) {
          authReq = this.addToken(request, token);
        }
        return next.handle(authReq);
      }),
      catchError(error => {
        // 2. Si hay error 401 (No autorizado), intentamos refrescar
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // Llamamos a la nueva función refreshToken del AuthService
      return this.authService.refreshToken().pipe(
        switchMap((tokenResponse: any) => {
          this.isRefreshing = false;
          // El nuevo token viene en la respuesta, o ya se guardó en el servicio
          this.refreshTokenSubject.next(tokenResponse.access);
          return next.handle(this.addToken(request, tokenResponse.access));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          // Si el refresh falla, logout y redirigir
          this.authService.logout(); 
          this.router.navigate(['/login']);
          return throwError(() => err);
        })
      );
    } else {
      // Si ya estamos refrescando, esperamos a que el subject emita el nuevo token
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this.addToken(request, jwt));
        })
      );
    }
  }
}