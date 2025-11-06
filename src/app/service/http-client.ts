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
  fecha_inicio: string; 
  fecha_termino: string; 
  fecha_subida: string; 
  // (Puedes añadir más campos de tu models.py si los necesitas)
}


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api/'; // La URL base de tu API

  constructor(private http: HttpClient) { }

  login(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}user/login/`, payload);
  }

  //Espacios y reservas
  getWorkspaces(): Observable<any> {
    return this.http.get(`${this.baseUrl}schedule/workspaces/`);
  }

  getSchedules(): Observable<any> {
    return this.http.get(`${this.baseUrl}schedule/schedules/`);
  }

  getWorkspaceById(id: number): Observable<Workspace> {
    // Asume que tu API responde con un objeto workspace en '.../workspaces/ID/'
    return this.http.get<Workspace>(`${this.baseUrl}schedule/workspaces/${id}/`);
  }

  /** Crea una nueva reserva (schedule) en el backend */
  createSchedule(payload: any) {
    return this.http.post(`${this.baseUrl}schedule/schedules/`, payload);
  }

  getSchedulesByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}schedule/schedules/user/${userId}/`);
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

  // Memorias y proyectos
  /** Obtiene la lista de todas las memorias/proyectos */
  getMemories(): Observable<Memory[]> {
    return this.http.get<Memory[]>(`${this.baseUrl}memos/memories/`);
  }

  /** Obtiene una memoria/proyecto por su ID */
  getMemoryById(id: number): Observable<Memory> {
    // Asume que tu API de detalle es 'memos/{id}/'
    return this.http.get<Memory>(`${this.baseUrl}memos/${id}/`); 
  }

  getEvents(): Observable<any> {
    return this.http.get(`${this.baseUrl}event/events/`);
  }

  creeateEvent(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}event/events/`, payload);
  }

  getFutureActivities(): Observable<any> {
    return this.http.get(`${this.baseUrl}event/future-activity/`);
  }

  getFutureActivitiesByWorkspaceId(workspaceId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}event/future-activity/${workspaceId}/`);
  }

}

export { HttpClient };
