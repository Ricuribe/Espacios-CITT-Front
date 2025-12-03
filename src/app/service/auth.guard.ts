import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, filter } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    // 1. Nos suscribimos al usuario actual
    return this.authService.currentUser$.pipe(
      // Filtramos 'undefined' para esperar a que el Storage termine de cargar (solución del bug de recarga)
      filter(user => user !== undefined), 
      take(1), // Tomamos solo el primer valor válido
      map(user => {
        
        // A) Si no hay usuario -> Al Login
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        // B) Si hay usuario, verificamos los roles de la ruta
        const allowedRoles = route.data['roles'] as Array<string>;
        
        // Si la ruta tiene roles definidos, verificamos si el usuario cumple
        if (allowedRoles && allowedRoles.length > 0) {
          const userRole = user.role || ''; // Rol del usuario actual
          
          if (allowedRoles.includes(userRole)) {
            return true; // Acceso concedido
          } else {
            // Rol no autorizado -> Redirigir a inicio-usuario
            console.warn(`Acceso denegado. Rol '${userRole}' no permitido en esta ruta.`);
            this.router.navigate(['/inicio-usuario']);
            return false;
          }
        }

        // C) Si la ruta no exige roles específicos, solo requería login -> Pase
        return true;
      })
    );
  }
}