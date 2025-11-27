import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

/**
 * StorageService - Wrapper para Ionic Storage
 *
 * Proporciona métodos para guardar y recuperar datos del usuario,
 * tokens de sesión y otros datos de la aplicación de forma persistente.
 *
 * Nota: Reemplaza callbacks con Promises/async-await para mejor manejo.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private isReady = false;

  constructor(private storage: Storage) {
    this.init();
  }

  /**
   * Inicializa el servicio de almacenamiento.
   * Debe ser llamado en el componente raíz o app.component.
   */
  private async init() {
    if (!this.isReady) {
      await this.storage.create();
      this.isReady = true;
    }
  }

  /**
   * Espera a que el storage esté listo.
   */
  private async ensureReady() {
    if (!this.isReady) {
      await this.init();
    }
  }

  // ========================================
  // MÉTODOS DE AUTENTICACIÓN
  // ========================================

  /**
   * Guarda el token de acceso.
   */
  async setAccessToken(token: string): Promise<any> {
    await this.ensureReady();
    return this.storage.set('access_token', token);
  }

  /**
   * Obtiene el token de acceso.
   */
  async getAccessToken(): Promise<string | null> {
    await this.ensureReady();
    return this.storage.get('access_token');
  }

  /**
   * Guarda el token de refresco.
   */
  async setRefreshToken(token: string): Promise<any> {
    await this.ensureReady();
    return this.storage.set('refresh_token', token);
  }

  /**
   * Obtiene el token de refresco.
   */
  async getRefreshToken(): Promise<string | null> {
    await this.ensureReady();
    return this.storage.get('refresh_token');
  }

  /**
   * Guarda ambos tokens de una sola vez.
   */
  async setTokens(accessToken: string, refreshToken: string): Promise<any> {
    await this.ensureReady();
    return Promise.all([
      this.setAccessToken(accessToken),
      this.setRefreshToken(refreshToken)
    ]);
  }

  /**
   * Obtiene ambos tokens.
   */
  async getTokens(): Promise<{ access: string | null; refresh: string | null }> {
    await this.ensureReady();
    const access = await this.getAccessToken();
    const refresh = await this.getRefreshToken();
    return { access, refresh };
  }

  /**
   * Borra todos los tokens.
   */
  async clearTokens(): Promise<any> {
    await this.ensureReady();
    return Promise.all([
      this.storage.remove('access_token'),
      this.storage.remove('refresh_token')
    ]);
  }

  // ========================================
  // MÉTODOS DE USUARIO
  // ========================================

  /**
   * Guarda la información del usuario actual.
   */
  async setUser(user: any): Promise<any> {
    await this.ensureReady();
    return this.storage.set('user', user);
  }

  /**
   * Obtiene la información del usuario actual.
   */
  async getUser(): Promise<any> {
    await this.ensureReady();
    return this.storage.get('user');
  }

  /**
   * Borra la información del usuario.
   */
  async clearUser(): Promise<any> {
    await this.ensureReady();
    return this.storage.remove('user');
  }

  // ========================================
  // MÉTODOS DE SESIÓN
  // ========================================

  /**
   * Borra todos los datos de sesión (usuario + tokens).
   * Se utiliza al hacer logout.
   */
  async clearSession(): Promise<any> {
    await this.ensureReady();
    return Promise.all([
      this.clearTokens(),
      this.clearUser(),
      this.clearRole()
    ]);
  }

  // ========================================
  // MÉTODOS DE ROL
  // ========================================

  /**
   * Guarda el rol del usuario (ej: 'administrativo'|'coordinador'|'alumno').
   */
  async setRole(role: string): Promise<any> {
    await this.ensureReady();
    return this.storage.set('role', role);
  }

  /**
   * Obtiene el rol del usuario.
   */
  async getRole(): Promise<string | null> {
    await this.ensureReady();
    return this.storage.get('role');
  }

  /**
   * Borra el rol del usuario.
   */
  async clearRole(): Promise<any> {
    await this.ensureReady();
    return this.storage.remove('role');
  }

  /**
   * Verifica si existe una sesión activa.
   */
  async hasSession(): Promise<boolean> {
    await this.ensureReady();
    const token = await this.getAccessToken();
    return token !== null && token !== undefined && token !== '';
  }

  // ========================================
  // MÉTODOS GENERALES
  // ========================================

  /**
   * Guarda un valor arbitrario.
   */
  async set(key: string, value: any): Promise<any> {
    await this.ensureReady();
    return this.storage.set(key, value);
  }

  /**
   * Obtiene un valor arbitrario.
   */
  async get(key: string): Promise<any> {
    await this.ensureReady();
    return this.storage.get(key);
  }

  /**
   * Borra un valor arbitrario.
   */
  async remove(key: string): Promise<any> {
    await this.ensureReady();
    return this.storage.remove(key);
  }

  /**
   * Borra todo el almacenamiento.
   */
  async clear(): Promise<any> {
    await this.ensureReady();
    return this.storage.clear();
  }
}
