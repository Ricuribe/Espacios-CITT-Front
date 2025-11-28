import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { map, switchMap, tap, catchError, finalize, filter } from 'rxjs/operators';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { ApiService } from './http-client'; // <--- Importamos ApiService

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Fuente de verdad del estado del usuario
  private currentUserSubject = new BehaviorSubject<User | null | undefined>(undefined);
  public currentUser$ = this.currentUserSubject.asObservable().pipe(
    filter(user => user !== undefined) // Para que otros componentes también esperen
  ) as Observable<User | null>;

  // Derivados para Guards y Vistas
  public isAuthenticated$ = this.currentUserSubject.pipe(
  filter(val => val !== undefined), // Espera hasta que deje de ser undefined
  map(user => !!user)
);
  public currentRole$ = this.currentUserSubject.pipe(map(user => user?.role || ''));

  constructor(
    private storageService: StorageService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.init();
  }

  private async init() {
    await this.loadSession();
  }

  /**
   * Carga la sesión desde Storage al iniciar la app
   */
  async loadSession() {
  // Aseguramos que storage esté listo
    const user = await this.storageService.get('user_session'); 
    
    if (user) {
      this.currentUserSubject.next(user); // Encontró usuario -> Pasa
    } else {
      this.currentUserSubject.next(null); // No encontró nada -> Rechaza explícitamente
    }
  }

  /**
   * LOGIN: Guarda tokens y usuario en local.
   * (La llamada a la API se hace en login.page.ts usando apiService.login, 
   * luego se llama a este método para persistir los datos).
   */
  async login(user: User, tokens: { access: string, refresh: string }) {
    // 1. Calcular Rol (tu lógica de dominio)
    const role = this.determineRoleFromEmail(user.email);
    const userWithRole = { ...user, role };

    // 2. Persistencia en Disco (Storage)
    await this.storageService.set('user_session', userWithRole);
    await this.storageService.setAccessToken(tokens.access);
    await this.storageService.set('refresh_token', tokens.refresh);

    // 3. Actualizar Estado en Memoria
    this.currentUserSubject.next(userWithRole);
  }

  /**
   * LOGOUT: Llama a la API para invalidar y limpia localmente.
   */
  async logout() {
    // 1. Recuperar refresh token
    const refreshToken = await this.storageService.get('refresh_token');

    if (refreshToken) {
      // 2. Llamada al Backend usando ApiService (usa el path correcto de http-client)
      this.apiService.logout(refreshToken)
        .pipe(
          finalize(() => {
            // 3. Limpieza local SIEMPRE (éxito o error)
            this.performLocalCleanup();
          })
        )
        .subscribe({
          next: () => console.log('Sesión cerrada en servidor'),
          error: (err) => console.warn('Error en logout servidor', err)
        });
    } else {
      this.performLocalCleanup();
    }
  }

  /**
   * Limpieza local y redirección
   */
  private async performLocalCleanup() {
    await this.storageService.clearSession(); // Tu método en StorageService
    
    // Limpieza de seguridad extra
    sessionStorage.clear();
    localStorage.clear();

    this.currentUserSubject.next(null);
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  /**
   * REFRESH TOKEN: Usado por el Interceptor
   */
  refreshToken(): Observable<any> {
    return from(this.storageService.get('refresh_token')).pipe(
      switchMap(token => {
        if (!token) {
          return throwError(() => new Error('No refresh token'));
        }
        // Llamada usando ApiService (path correcto)
        return this.apiService.refreshToken(token);
      }),
      tap(async (res) => {
        await this.storageService.setAccessToken(res.access);
        if (res.refresh) {
          await this.storageService.set('refresh_token', res.refresh);
        }
      }),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  getAccessToken(): Promise<string | null> {
    return this.storageService.getAccessToken();
  }

  // --- Lógica de Negocio ---
  private determineRoleFromEmail(email: string): string {
    if (!email) return 'alumno';
    const lower = email.toLowerCase();
    if (lower.endsWith('@duoc.cl')) return 'administrativo';
    if (lower.endsWith('@profesor.duoc.cl')) return 'coordinador';
    return 'alumno';
  }
}