import { Component, OnInit } from '@angular/core'; // <-- CAMBIO: Añadido OnInit
import { CommonModule } from '@angular/common';
import { ApiService } from 'src/app/service/http-client';
import { RouterLink } from '@angular/router'; // <-- CAMBIO: Añadido para [routerLink]
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonImg,
  IonButtons,
  IonButton,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonMenu,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner

} from '@ionic/angular/standalone';

@Component({
  selector: 'app-mis-solicitudes',
  templateUrl: './mis-solicitudes.page.html',
  styleUrls: ['./mis-solicitudes.page.scss'],
  standalone: true,
  
  imports: [
    CommonModule,
    RouterLink, // <-- CAMBIO: Añadido aquí
    IonHeader,
    IonToolbar,
    IonTitle,
    IonImg,
    IonButtons,
    IonButton,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonMenu,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel
    ,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonSpinner
  ]
})
export class MisSolicitudesPage implements OnInit {
  workspaces: any[] = [];
  schedules: any[] = [];
  error: any;
  isLoading = false;
  userId: number | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.getWorkspacesData();
    this.loadSchedulesForUser();
  }

  getWorkspacesData() {
    this.apiService.getWorkspaces().subscribe({
      next: (data) => {
        this.workspaces = data;
        console.log('Workspaces:', this.workspaces);
      },
      error: (err) => {
        this.error = err;
        console.error('Error fetching workspaces:', err);
      }
    });
  }

  getSchedulesData() {
    this.apiService.getSchedules().subscribe({
      next: (data) => {
        this.schedules = data;
        console.log('Schedules:', this.schedules);
      },
      error: (err) => {
        this.error = err;
        console.error('Error fetching schedules:', err);
      }
    });
  }

  private tryReadUserId(): number | null {
    try {
      const userRaw = sessionStorage.getItem('user');
      if (userRaw) {
        const parsed = JSON.parse(userRaw);
        return parsed?.id ?? parsed?.userId ?? null;
      }
      const alt = sessionStorage.getItem('userId');
      if (alt) return +alt;
    } catch (err) {
      const alt = sessionStorage.getItem('userId');
      if (alt) return +alt;
    }
    return null;
  }

  loadSchedulesForUser() {
    this.userId = this.tryReadUserId();
    if (!this.userId) {
      this.error = { message: 'No se encontró el userId en sessionStorage' };
      return;
    }

    this.isLoading = true;
    this.apiService.getSchedulesByUserId(this.userId).subscribe({
      next: (data: any[]) => {
        // normalize and enrich schedules
        this.schedules = (data || []).map(s => ({
          ...s,
          displayDate: s.date_scheduled || (s.start_time ? s.start_time.split('T')[0] : ''),
          displayStart: this.formatTime(s.start_time),
          displayEnd: this.formatTime(s.end_time),
          workspaceName: ''
        }));

        // Use forkJoin to fetch unique workspace names in parallel (faster)
        const uniqueIds = Array.from(new Set(this.schedules.map(s => +s.workspace).filter(Boolean)));
        if (uniqueIds.length === 0) {
          this.isLoading = false;
          return;
        }

        const calls = uniqueIds.map(id =>
          this.apiService.getWorkspaceById(id).pipe(
            map((ws: any) => ({ id, name: ws?.name ?? `Espacio ${id}` })),
            catchError(() => of({ id, name: `Espacio ${id}` }))
          )
        );

        forkJoin(calls).subscribe({
          next: (results: any[]) => {
            const mapName = new Map<number,string>();
            results.forEach(r => mapName.set(r.id, r.name));
            this.schedules.forEach(sch => {
              const wid = +sch.workspace;
              sch.workspaceName = mapName.get(wid) ?? `Espacio ${wid}`;
            });
            this.isLoading = false;
          },
          error: (err) => {
            console.warn('Error fetching workspaces in parallel', err);
            this.schedules.forEach((sch) => sch.workspaceName = `Espacio ${sch.workspace}`);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        this.error = err;
        this.isLoading = false;
        console.error('Error fetching schedules by user:', err);
      }
    });
  }

  statusLabel(status: number): string {
    switch (status) {
      case 0: return 'Rechazada';
      case 1: return 'Agendada';
      case 2: return 'Aprobada';
      case 3: return 'Asistida';
      case 4: return 'Inasistida';
      default: return 'Desconocido';
    }
  }

  statusClass(status: number): string {
    switch (status) {
      case 0: return 'status-rechazada';
      case 1: return 'status-agendada';
      case 2: return 'status-aprobada';
      case 3: return 'status-asistida';
      case 4: return 'status-inasistida';
      default: return '';
    }
  }

  private formatTime(iso?: string): string {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const hh = d.getHours().toString().padStart(2, '0');
      const mm = d.getMinutes().toString().padStart(2, '0');
      return `${hh}:${mm}`;
    } catch (e) {
      // fallback parse
      const parts = (iso || '').split('T')[1];
      if (!parts) return '';
      const hhmm = parts.split(':').slice(0,2).join(':');
      return hhmm;
    }
  }
}
