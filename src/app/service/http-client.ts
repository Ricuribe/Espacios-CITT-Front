import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workspace } from '../interfaces/workspace';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api/'; // La URL base de tu API

  constructor(private http: HttpClient) { }

  getWorkspaces(): Observable<any> {
    return this.http.get(`${this.baseUrl}schedule/workspaces/`);
  }

  getSchedules(): Observable<any> {
    return this.http.get(`${this.baseUrl}schedules/`);
  }

  getWorkspaceById(id: number): Observable<Workspace> {
    // Asume que tu API responde con un objeto workspace en '.../workspaces/ID/'
    return this.http.get<Workspace>(`${this.baseUrl}workspaces/${id}/`);
  }
}