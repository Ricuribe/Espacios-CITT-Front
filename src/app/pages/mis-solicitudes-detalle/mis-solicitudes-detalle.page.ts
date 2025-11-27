import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/service/http-client';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel
  ,
  IonGrid,
  IonRow,
  IonCol,
  IonImg
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-mis-solicitudes-detalle',
  templateUrl: './mis-solicitudes-detalle.page.html',
  styleUrls: ['./mis-solicitudes-detalle.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonGrid, IonRow, IonCol, IonImg]
})
export class MisSolicitudesDetallePage implements OnInit {

  public schedule: any = null;
  public isLoading = true;
  public error: any = null;
  public workspaceName = '';
  public workspaceImage: string | null = null;
  public scheduleDetails: any[] = [];
  public cancelling = false;
  constructor(private route: ActivatedRoute, private router: Router, private apiService: ApiService, private alertController: AlertController) { }

  ngOnInit() {
    // Leer query param 'id'
    const idParam = this.route.snapshot.queryParamMap.get('id');
    const id = idParam ? +idParam : null;
    if (!id) {
      this.error = { message: 'No se recibió id de agendamiento' };
      this.isLoading = false;
      return;
    }

    this.loadScheduleDetail(id);
  }

  private loadScheduleDetail(id: number) {
    this.isLoading = true;
    this.error = null;
    this.apiService.getSchedulesByUserId(id).subscribe({
      next: (data: any) => {
        this.schedule = data;
        // formato fecha y horas
        this.schedule.displayDate = data.date_scheduled || (data.start_time ? data.start_time.split('T')[0] : '');
        this.schedule.displayStart = this.formatTime(data.start_time);
        this.schedule.displayEnd = this.formatTime(data.end_time);

        // cargar workspace name
        const wid = +data.workspace;
        if (wid) {
          this.apiService.getWorkspaceById(wid).subscribe({
            next: (ws: any) => {
              this.workspaceName = ws?.name ?? `Espacio ${wid}`;
              this.workspaceImage = ws?.image ?? null;
              this.isLoading = false;
            },
            error: (err: any) => {
              console.warn('Error cargando workspace', err);
              this.workspaceName = `Espacio ${wid}`;
              this.workspaceImage = null;
              this.isLoading = false;
            }
          });
        } else {
          this.workspaceName = `Espacio ${data.workspace}`;
          this.workspaceImage = null;
          this.isLoading = false;
        }

        // Cargar detalle (team, attendees, project, description)
        this.apiService.getSchedulesByUserId(id).subscribe({
          next: (details: any[]) => {
            this.scheduleDetails = Array.isArray(details) ? details : [];
          },
          error: (err: any) => {
            console.warn('No hay details para este schedule o error', err);
            this.scheduleDetails = [];
          }
        });
      },
      error: (err: any) => {
        console.error('Error cargando detalle de schedule', err);
        this.error = err;
        this.isLoading = false;
      }
    });
  }

  private formatTime(iso?: string): string {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const hh = d.getHours().toString().padStart(2, '0');
      const mm = d.getMinutes().toString().padStart(2, '0');
      return `${hh}:${mm}`;
    } catch (e) {
      const parts = (iso || '').split('T')[1];
      if (!parts) return '';
      return parts.split(':').slice(0,2).join(':');
    }
  }

  statusLabel(status: number): string {
    switch (status) {
      case 0: return 'Rechazada';
      case 1: return 'Agendada';
      case 2: return 'Aprobada';
      case 3: return 'Asistida';
      case 4: return 'Inasistida';
      case 6: return 'Cancelada';
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
      case 6: return 'status-cancelada';
      default: return '';
    }
  }

  goBack() {
    // Evitar volver a páginas de registro o login
    try {
      const ref = document.referrer || '';
      if (ref.includes('/registro') || ref.includes('/login')) {
        this.router.navigate(['/mis-solicitudes']);
        return;
      }
    } catch (e) {
      // ignore and fallback
    }
    // usar history.back como preferencia
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/mis-solicitudes']);
    }
  }

  async confirmCancel() {
    if (!this.schedule) return;
    const alert = await this.alertController.create({
      header: 'Confirmar cancelación',
      message: '¿Estás seguro que deseas cancelar esta solicitud?',
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Sí, cancelar', handler: () => { this.doCancel(); } }
      ]
    });
    await alert.present();
  }

  private doCancel() {
    if (!this.schedule) return;
    const id = this.schedule.id_schedule ?? this.schedule.id;
    if (!id) return;
    this.cancelling = true;
    this.apiService.updateManagementEvent(id, 6).subscribe({
      next: (res: any) => {
        this.cancelling = false;
        // actualizar estado local
        if (this.schedule) this.schedule.status = 6;
        this.alertController.create({ header: 'Cancelada', message: 'La solicitud fue cancelada correctamente.', buttons: ['OK'] }).then(a => a.present());
      },
      error: (err: any) => {
        this.cancelling = false;
        console.error('Error cancelando', err);
        this.alertController.create({ header: 'Error', message: 'No se pudo cancelar la solicitud. Intenta más tarde.', buttons: ['OK'] }).then(a => a.present());
      }
    });
  }

}
