import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService } from './http-client';
import { StorageService } from './storage.service';

/**
 * Interfaz para la respuesta de login/registro.
 */
export interface AuthResponse {
  refresh: string;
  access: string;
  user: User;
}

/**
 * Interfaz para el modelo de usuario de Django.
 */
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

/**
 * Interfaz para la respuesta de logout.
 */
export interface LogoutResponse {
  detail?: string;
  message?: string;
}

/**
 * AuthService - Gestión completa de autenticación y usuario
 *
 * Responsabilidades:
 * - Login/Register/Logout
 * - Manejo de tokens (access y refresh)
 * - Almacenamiento persistente de sesión
 * - Estado reactivo del usuario actual
 * - Validación de sesión y refresh automático
 *
 * Uso:
 * - Inyectar en componentes o servicios
 * - Escuchar cambios de usuario: authService.getCurrentUser().subscribe(...)
 * - Verificar autenticación: authService.isAuthenticated().subscribe(...)
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // BehaviorSubject para estado reactivo
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Rol del usuario (administrativo | coordinador | alumno)
  private currentRoleSubject = new BehaviorSubject<string | null>(null);
  public currentRole$ = this.currentRoleSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private storageService: StorageService
  ) {
    this.initializeAuthState();
  }

  /**
   * Inicializa el estado de autenticación al cargar el servicio.
   * Restaura la sesión desde el storage si existe.
   */
  private async initializeAuthState() {
    try {
      const user = await this.storageService.getUser();
      const token = await this.storageService.getAccessToken();
      const role = await this.storageService.getRole();

      if (user && token) {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        this.currentRoleSubject.next(role || null);
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
    }
  }

  // ========================================
  // OBSERVABLE GETTERS
  // ========================================

  /**
   * Obtiene el usuario actual como Observable.
   */
  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  /**
   * Obtiene el estado de autenticación como Observable.
   */
  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$;
  }

  /**
   * Obtiene el usuario actual de forma síncrona (usar con cuidado).
   */
  getCurrentUserSync(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtiene el rol actual de forma síncrona.
   */
  getCurrentRoleSync(): string | null {
    return this.currentRoleSubject.value;
  }

  /**
   * Obtiene el estado de autenticación de forma síncrona.
   */
  isAuthenticatedSync(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // ========================================
  // AUTENTICACIÓN: LOGIN
  // ========================================

  /**
   * Login del usuario con email y contraseña.
   *
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Observable<AuthResponse> o Observable<any> con error
   */
  login(email: string, password: string): Observable<AuthResponse> {
    const payload = { email, password };

    return this.apiService.login(payload).pipe(
      tap((response: AuthResponse) => {
        this.handleAuthSuccess(response);
      }),
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  // ========================================
  // AUTENTICACIÓN: REGISTRO
  // ========================================

  /**
   * Registro de nuevo usuario.
   *
   * @param email - Email del usuario
   * @param password - Contraseña
   * @param first_name - Nombre del usuario
   * @param last_name - Apellido del usuario (opcional, si se proporciona)
   * @returns Observable<AuthResponse>
   */
  register(
    email: string,
    password: string,
    first_name: string,
    last_name: string = ''
  ): Observable<AuthResponse> {
    // Extrae el username del email (lo que está antes del @)
    const username = email.split('@')[0];

    const payload = {
      email,
      password,
      username,
      first_name,
      last_name
    };

    return this.apiService.register(payload).pipe(
      tap((response: AuthResponse) => {
        this.handleAuthSuccess(response);
      }),
      catchError((error) => {
        console.error('Register error:', error);
        throw error;
      })
    );
  }

  // ========================================
  // AUTENTICACIÓN: LOGOUT
  // ========================================

  /**
   * Logout del usuario.
   * Envía el token de refresco al backend para invalidarlo y luego limpia el storage local.
   *
   * @returns Observable<LogoutResponse>
   */
  logout(): Observable<LogoutResponse> {
    return new Observable((observer) => {
      (async () => {
        try {
          const refreshToken = await this.storageService.getRefreshToken();

          if (!refreshToken) {
            // Si no hay refresh token, solo limpiamos localmente
            await this.handleLogoutSuccess();
            observer.next({ message: 'Logged out (no token to revoke)' });
            observer.complete();
            return;
          }

          // Enviamos logout al backend
          const payload = { refresh: refreshToken };
          this.apiService.logout(payload).subscribe({
            next: (response: LogoutResponse) => {
              (async () => {
                await this.handleLogoutSuccess();
                observer.next(response);
                observer.complete();
              })();
            },
            error: (error) => {
              // Aun si hay error en revoke, limpiamos localmente
              (async () => {
                await this.handleLogoutSuccess();
                console.warn('Logout server error, but cleared local session:', error);
                observer.next({ message: 'Local session cleared despite server error' });
                observer.complete();
              })();
            }
          });
        } catch (error) {
          console.error('Logout error:', error);
          observer.error(error);
        }
      })();
    });
  }

  // ========================================
  // MANEJO DE TOKENS
  // ========================================

  /**
   * Refresca el token de acceso usando el token de refresco.
   * Este método es llamado automáticamente por el interceptor.
   *
   * @returns Observable<any> con el nuevo access token
   */
  refreshAccessToken(): Observable<any> {
    return new Observable((observer) => {
      (async () => {
        try {
          const refreshToken = await this.storageService.getRefreshToken();

          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const payload = { refresh: refreshToken };

          this.apiService.refreshToken(payload).subscribe({
            next: (response: any) => {
              (async () => {
                // El backend devuelve { access: "..." }
                await this.storageService.setAccessToken(response.access);
                observer.next(response);
                observer.complete();
              })();
            },
            error: (error) => {
              // Si el refresh falla, limpiamos la sesión
              (async () => {
                await this.storageService.clearSession();
                    this.currentUserSubject.next(null);
                    this.currentRoleSubject.next(null);
                    this.isAuthenticatedSubject.next(false);
                console.error('Token refresh failed, session cleared:', error);
                observer.error(error);
              })();
            }
          });
        } catch (error) {
          console.error('Refresh token error:', error);
          observer.error(error);
        }
      })();
    });
  }

  /**
   * Obtiene el token de acceso actual.
   */
  async getAccessToken(): Promise<string | null> {
    return this.storageService.getAccessToken();
  }

  /**
   * Obtiene el token de refresco actual.
   */
  async getRefreshToken(): Promise<string | null> {
    return this.storageService.getRefreshToken();
  }

  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================

  /**
   * Maneja el éxito en login/register.
   * Guarda tokens y usuario en storage y actualiza estados.
   */
  private async handleAuthSuccess(response: AuthResponse) {
    try {
      // Guardar tokens
      await this.storageService.setTokens(response.access, response.refresh);

      // Guardar usuario
      await this.storageService.setUser(response.user);

      // Determinar rol desde el email y guardarlo
      const role = this.determineRoleFromEmail(response.user.email);
      await this.storageService.setRole(role);
      this.currentRoleSubject.next(role);

      // Actualizar BehaviorSubjects
      this.currentUserSubject.next(response.user);
      this.isAuthenticatedSubject.next(true);
    } catch (error) {
      console.error('Error saving auth state:', error);
      throw error;
    }
  }

  /**
   * Maneja el éxito en logout.
   * Borra sesión del storage y actualiza estados.
   */
  private async handleLogoutSuccess() {
    try {
      await this.storageService.clearSession();
      this.currentUserSubject.next(null);
      this.currentRoleSubject.next(null);
      this.isAuthenticatedSubject.next(false);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  /**
   * Determina el rol a partir del email.
   * Reglas (temporales según especificación):
   * - termina en `@duoc.cl` => 'administrativo'
   * - termina en `@profesor.duoc.cl` => 'coordinador'
   * - termina en `@duocuc.cl` => 'alumno'
   * - cualquier otro dominio => 'alumno' (temporal)
   */
  private determineRoleFromEmail(email: string): string {
    if (!email) return 'alumno';
    const lower = email.toLowerCase();
    if (lower.endsWith('@duoc.cl')) return 'administrativo';
    if (lower.endsWith('@profesor.duoc.cl')) return 'coordinador';
    if (lower.endsWith('@duocuc.cl')) return 'alumno';
    // Default temporal: tratar como alumno
    return 'alumno';
  }

  /**
   * Chequea si el usuario tiene el rol indicado.
   */
  isInRole(role: string): boolean {
    const current = this.getCurrentRoleSync();
    return current === role;
  }
}
