import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

/**
 * AuthGuard - Protección de rutas basada en autenticación
 *
 * Responsabilidades:
 * - Verificar que el usuario esté autenticado antes de acceder a rutas protegidas
 * - Redirigir a login si no hay sesión activa
 * - Permitir navegación solo si isAuthenticated$ es true
 *
 * Uso en rutas:
 * ```
 * const routes: Routes = [
 *   {
 *     path: 'dashboard',
 *     component: DashboardComponent,
 *     canActivate: [AuthGuard]
 *   }
 * ];
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map((isAuthenticated) => {
        if (isAuthenticated) {
          return true;
        } else {
          // Redirige a login y guarda la URL solicitada
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: state.url }
          });
          return false;
        }
      })
    );
  }
}
