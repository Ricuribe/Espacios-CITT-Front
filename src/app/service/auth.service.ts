import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: string; // Agregamos el rol a la interfaz para tipado fuerte
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl || 'http://localhost:8000/api';
  // Solo necesitamos UNA fuente de verdad: el usuario actual
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // El rol y el estado de autenticación se derivan del usuario
  public isAuthenticated$ = this.currentUserSubject.pipe(map(user => !!user));
  public currentRole$ = this.currentUserSubject.pipe(map(user => user?.role || ''));

  constructor(private storageService: StorageService,
    private http: HttpClient
  ) {
    this.init();
  }

  private async init() {
    await this.loadSession();
  }

  /**
   * Carga la sesión desde el almacenamiento local al iniciar la app.
   */
  async loadSession() {
    const user = await this.storageService.get('user_session');
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  /**
   * Login: Guarda sesión y actualiza el estado reactivo.
   * NOTA: Aquí integramos tu lógica de roles basada en dominio.
   */
  async login(responseUser: User, tokens: { access: string, refresh: string }) {
    // 1. Determinar rol (Lógica crítica de tu negocio actual)
    const role = this.determineRoleFromEmail(responseUser.email);
    const userWithRole = { ...responseUser, role };

    // 2. Guardar en Storage (Persistencia)
    await this.storageService.set('user_session', userWithRole);
    await this.storageService.setAccessToken(tokens.access);
    await this.storageService.set('refresh_token', tokens.refresh);

    // 3. Actualizar estado en memoria (Reactividad)
    this.currentUserSubject.next(userWithRole);
  }

  /**
   * Logout: Limpia todo.
   */
  async logout() {
    await this.storageService.clearSession(); // Asume que este método limpia todo el storage relevante
    this.currentUserSubject.next(null);
  }

  /**
   * Helper simple para obtener el valor actual del rol sin suscribirse (para lógica síncrona simple)
   */
  getCurrentRoleValue(): string {
    return this.currentUserSubject.value?.role || '';
  }

  // --- Lógica de Negocio Específica ---

  private determineRoleFromEmail(email: string): string {
    if (!email) return 'alumno';
    const lower = email.toLowerCase();
    if (lower.endsWith('@duoc.cl')) return 'administrativo';
    if (lower.endsWith('@profesor.duoc.cl')) return 'coordinador';
    return 'alumno';
  }

  refreshToken(): Observable<any> {
    // 1. Obtenemos el refresh token del almacenamiento
    return from(this.storageService.get('refresh_token')).pipe(
      switchMap(token => {
        if (!token) {
          return throwError(() => new Error('No refresh token available'));
        }
        // 2. Llamamos al endpoint de Django (Simple JWT)
        return this.http.post<any>(`${this.apiUrl}/token/refresh/`, { refresh: token });
      }),
      tap(async (response) => {
        // 3. Si funciona, guardamos el nuevo Access Token
        await this.storageService.setAccessToken(response.access);
        // Si el backend rota el refresh token, guárdalo también
        if (response.refresh) {
          await this.storageService.set('refresh_token', response.refresh);
        }
      }),
      catchError(error => {
        // 4. Si falla (refresh expirado), cerramos sesión forzosamente
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Helper para obtener el token actual (para el interceptor)
   */
  getAccessToken(): Promise<string | null> {
    return this.storageService.getAccessToken();
  }


}