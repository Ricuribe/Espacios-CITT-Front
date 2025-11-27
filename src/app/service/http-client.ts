import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workspace } from '../interfaces/workspace'; // Asume que tienes este archivo

// ==========================================================
// INTERFAZ "MEMORY" BASADA EN TU MODELS.PY
// ==========================================================
export interface Memory {
  id_memo: number;
  titulo: string;
  imagen_display: string;
  profesor: string;
  descripcion: string;
  loc_disco: string; 
  escuela: any;
  carrera: any;
  entidad_involucrada: string; 
  tipo_entidad: string; 
  tipo_memoria: string;
  fecha_inicio: string; 
  fecha_termino: string; 
  fecha_subida: string; 
  // (Puedes añadir más campos de tu models.py si los necesitas)
}


@Injectable({
  providedIn: 'root'
})
export class ApiService {
    private baseUrl = 'http://localhost:8000/api/'; // Api Gateway
  
  /* private baseUrl = 'http://localhost:8001/api/'; // Gestion
  private baseUrl2 = 'http://localhost:8003/api/'; //agendamiento
  private baseUrl3 = 'http://localhost:8002/api/'; //repositorio  */

  constructor(private http: HttpClient) { }

  // URLS DE AUTENTICACION

  register(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}auth/register/`, payload);
  }

  login(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}auth/login/`, payload);
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}auth/me/`);
  }

  /**
   * Logout: envía el token de refresh al backend para invalidarlo.
   * El backend debe aceptar un payload como { refresh: "..." }
   */
  logout(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}auth/logout/`, payload);
  }

  /** Refresh token - soporte para endpoints tipo SimpleJWT. */
  refreshToken(payload: any): Observable<any> {
    // Intentamos la ruta común 'auth/refresh/'
    return this.http.post(`${this.baseUrl}auth/refresh/`, payload);
  }

  //Espacios y reservas
  getWorkspaces(): Observable<any> {
    return this.http.get(`${this.baseUrl}manage/manage/workspaces/`);
  }

  getSchedules(): Observable<any> {
    return this.http.get(`${this.baseUrl}/event/event/events/`);
  }

  getWorkspaceById(id: number): Observable<Workspace> {
    // Asume que tu API responde con un objeto workspace en '.../workspaces/ID/'
    return this.http.get<Workspace>(`${this.baseUrl}manage/manage/workspaces/${id}/`);
  }

  getSchedulesByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}event/event/events/user/${userId}/`);
  }

  // Memorias y proyectos --------------------------------
  /** Obtiene la lista de todas las memorias/proyectos */
  getMemories(): Observable<Memory[]> {
    return this.http.get<Memory[]>(`${this.baseUrl}memos/memos/memories/`);
  }

  /** Obtiene una memoria/proyecto por su ID + detalles*/
  getMemoryById(id: number): Observable<any> {
    // Asume que tu API de detalle es 'memos/{id}/'
    return this.http.get<Memory>(`${this.baseUrl}memos/memos/${id}/`); 
  }

  downloadMemoryPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}memos/memos/download/${id}/`, { responseType: 'blob' });
  }

  createMemory(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}memos/memos/memories/`, formData);
  }

  getOnlyMemoryById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}memos/memos/memories/${id}/`);
  }

  /** Actualiza la memoria (sin detalles) */
  updateMemoryPut(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}memos/memos/memories/${id}/`, formData);
  }
  /**
   * PATCH: Actualización parcial.
   * Angular detecta el Content-Type automáticamente:
   * - Si 'data' es un objeto JS plano -> Content-Type: application/json
   * - Si 'data' es FormData -> Content-Type: multipart/form-data (con boundary)
   */
  updateMemoryPatch(id: number, data: any | FormData): Observable<any> {
    return this.http.patch(`${this.baseUrl}memos/memos/memories/${id}/`, data);
  }

  deleteMemory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}memos/memos/memories/${id}/`);
  }

  // Detalles de memoria -----------------------------

  getMemoryDetails(idMemo: number): Observable<any> {
    return this.http.get(`${this.baseUrl}memos/memos/memories/${idMemo}/detalles/`);
  }

  addMemoryDetail(idMemo: number, detailData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}memos/memos/memories/${idMemo}/add_detalle/`, detailData);
  }

  updateMemoryDetail(idMemo: number, idDetalle: number, detailData: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}memos/memos/memories/${idMemo}/update_detalle/${idDetalle}/`, detailData);
  }

  deleteMemoryDetail(idMemo: number, idDetalle: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}memos/memos/memories/${idMemo}/delete_detalle/${idDetalle}/`);
  }

  // Eventos y actividades futuras -----------------------------

  getEvents(): Observable<any> {
    return this.http.get(`${this.baseUrl}event/event/events/`);
  }

  creeateEvent(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}event/event/events/`, payload);
  }

  getFutureActivities(): Observable<any> {
    return this.http.get(`${this.baseUrl}event/future-activity/`);
  }

  getFutureActivitiesByWorkspaceId(allSpaces: boolean | false ,workspaceId: number[]): Observable<any> {
    return this.http.get(`${this.baseUrl}event/future-activity/?all=${allSpaces}&spaces=${workspaceId.join(',')}`);
  }

  /**
   * Obtiene eventos programados.
   * @param today Si es true, trae eventos del día. Si es false, trae futuros.
   */
  getScheduledEvents(today: boolean): Observable<any> {
    return this.http.get(`${this.baseUrl}event/scheduled-events/?today=${today}`);
  }

  // GESTION DE EVENTOS -----------------------------
  /**
   * Obtiene lista de eventos para gestión. 
   * Soporta filtros opcionales (status, fecha, etc.) si el backend los implementa.
   */
  getManagementEvents(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params = params.append(key, filters[key]);
        }
      });
    }
    // Asumiendo que la ruta en manage_service/urls.py es 'manage/events/'
    return this.http.get(`${this.baseUrl}manage/manage/events-manage/`, { params });
  }

  /** Obtiene un evento específico para edición */
  getManagementEventById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}manage/manage/events-manage/${id}/`);
  }

  /** Actualiza un evento completo (PUT) */
  updateManagementEvent(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}manage/manage/events-manage/${id}/`, data);
  }

  /** * Cambia el estado del evento (Confirmar/Rechazar).
   * Usamos PATCH para actualizar parcialmente.
   */
  patchManagementEventStatus(id: number, status: number, comment?: string): Observable<any> {
    const payload: any = { status };
    if (comment) {
      payload.admin_comment = comment; // Asumiendo que existe un campo para comentarios de admin
    }
    return this.http.patch(`${this.baseUrl}manage/manage/events-manage/${id}/`, payload);
  }
  
}

export { HttpClient };
