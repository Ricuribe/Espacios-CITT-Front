import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private _initPromise: Promise<void> | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    // Patrón Singleton para evitar reinicializaciones
    if (!this._initPromise) {
      this._initPromise = (async () => {
        const storage = await this.storage.create();
        this._storage = storage;
      })();
    }
    return this._initPromise;
  }

  private async ensureReady() {
    await this.init();
  }

  // --- MÉTODOS GENÉRICOS ---

  async set(key: string, value: any) {
    await this.init();
    return this._storage?.set(key, value);
  }

  async get(key: string) {
    await this.init();
    return this._storage?.get(key);
  }

  async remove(key: string) {
    await this.init();
    return this._storage?.remove(key);
  }

  async clear() {
    await this.init();
    return this._storage?.clear();
  }

  // --- MÉTODOS ESPECÍFICOS DE AUTH ---

  async setAccessToken(token: string) {
    return this.set('access_token', token);
  }

  async getAccessToken(): Promise<string | null> {
    return this.get('access_token');
  }

  async getUser() {
    await this.ensureReady();
    return this._storage?.get('user_session');
  }

  /**
   * LIMPIEZA TOTAL DE SESIÓN
   * Elimina tokens y datos de usuario, pero preserva otras configuraciones 
   * si existieran (ej. tema oscuro, idioma).
   */
  async clearSession() {
    await this.init();
    await this._storage?.remove('user_session');
    await this._storage?.remove('access_token');
    await this._storage?.remove('refresh_token');
    // Si tuvieras otras llaves sensibles, agrégalas aquí.
  }
}