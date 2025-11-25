import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  private baseUrl = 'http://localhost:8001/api/'; // La URL base de tu API
  private baseUrl2 = 'http://localhost:8003/api/'; //agendamiento
  private baseUrl3 = 'http://localhost:8002/api/'; //repositorio 
  constructor(private http: HttpClient) { }

  login(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}user/login/`, payload);
  }

  //Espacios y reservas
  getWorkspaces(): Observable<any> {
    return this.http.get(`${this.baseUrl}manage/workspaces/`);
  }

  getSchedules(): Observable<any> {
    return this.http.get(`${this.baseUrl3}event/events/`);
  }

  getWorkspaceById(id: number): Observable<Workspace> {
    // Asume que tu API responde con un objeto workspace en '.../workspaces/ID/'
    return this.http.get<Workspace>(`${this.baseUrl}manage/workspaces/${id}/`);
  }

  /** Crea una nueva reserva (schedule) en el backend */
  createSchedule(payload: any) {
    return this.http.post(`${this.baseUrl2}schedule/schedules/`, payload);
  }

  getSchedulesByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl2}event/events/user/${userId}/`);
  }

  /** Obtiene un schedule por su id */
  getScheduleById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}schedule/schedules/${id}/`);
  }

  getScheduleDetailById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}schedule/schedules/${id}/details/`);
  }

  /** Actualiza campos de un schedule (patch). Usado para cambiar status, etc. */
  updateScheduleStatus(id: number, status: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}schedule/schedules/${id}/`, { status });
  }

  // Memorias y proyectos --------------------------------
  /** Obtiene la lista de todas las memorias/proyectos */
  getMemories(): Observable<Memory[]> {
    return this.http.get<Memory[]>(`${this.baseUrl3}memos/memories/`);
  }

  /** Obtiene una memoria/proyecto por su ID + detalles*/
  getMemoryById(id: number): Observable<any> {
    // Asume que tu API de detalle es 'memos/{id}/'
    return this.http.get<Memory>(`${this.baseUrl3}memos/${id}/`); 
  }

  downloadMemoryPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl3}memos/download/${id}/`, { responseType: 'blob' });
  }

  createMemory(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl3}memos/memories/`, formData);
  }

  getOnlyMemoryById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl3}memos/memories/${id}/`);
  }

  /** Actualiza la memoria (sin detalles) */
  updateMemoryPut(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl3}memos/memories/${id}/`, formData);
  }
  /**
   * PATCH: Actualización parcial.
   * Angular detecta el Content-Type automáticamente:
   * - Si 'data' es un objeto JS plano -> Content-Type: application/json
   * - Si 'data' es FormData -> Content-Type: multipart/form-data (con boundary)
   */
  updateMemoryPatch(id: number, data: any | FormData): Observable<any> {
    return this.http.patch(`${this.baseUrl3}memos/memories/${id}/`, data);
  }

  deleteMemory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl3}memos/memories/${id}/`);
  }

  // Detalles de memoria -----------------------------

  getMemoryDetails(idMemo: number): Observable<any> {
    return this.http.get(`${this.baseUrl3}memos/memories/${idMemo}/detalles/`);
  }

  addMemoryDetail(idMemo: number, detailData: any): Observable<any> {
    return this.http.post(`${this.baseUrl3}memos/memories/${idMemo}/add_detalle/`, detailData);
  }

  updateMemoryDetail(idMemo: number, idDetalle: number, detailData: any): Observable<any> {
    return this.http.patch(`${this.baseUrl3}memos/memories/${idMemo}/update_detalle/${idDetalle}/`, detailData);
  }

  deleteMemoryDetail(idMemo: number, idDetalle: number): Observable<any> {
    return this.http.delete(`${this.baseUrl3}memos/memories/${idMemo}/delete_detalle/${idDetalle}/`);
  }

  // Eventos y actividades futuras -----------------------------

  getEvents(): Observable<any> {
    return this.http.get(`${this.baseUrl2}event/events/`);
  }

  creeateEvent(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl2}event/events/`, payload);
  }

  getFutureActivities(): Observable<any> {
    return this.http.get(`${this.baseUrl2}future-activity/`);
  }

  getFutureActivitiesByWorkspaceId(allSpaces: boolean | false ,workspaceId: number[]): Observable<any> {
    return this.http.get(`${this.baseUrl2}future-activity/?all=${allSpaces}&spaces=${workspaceId.join(',')}`);
  }

  /**
   * Obtiene eventos programados.
   * @param today Si es true, trae eventos del día. Si es false, trae futuros.
   */
  getScheduledEvents(today: boolean): Observable<any> {
    return this.http.get(`${this.baseUrl2}scheduled-events/?today=${today}`);
  }

}

export { HttpClient };
