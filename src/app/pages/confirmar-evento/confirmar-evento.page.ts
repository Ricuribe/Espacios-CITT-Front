import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlertController, IonHeader, IonToolbar, IonTitle, IonImg, IonButtons, IonButton, IonContent, IonGrid, IonRow, IonCol, IonIcon, IonList, IonItem, IonLabel, IonInput, IonTextarea,
IonMenu, IonMenuButton, IonSpinner, IonText, IonToggle } from '@ionic/angular/standalone';
import { ApiService } from 'src/app/service/http-client';

@Component({
  selector: 'app-confirmar-evento',
  templateUrl: './confirmar-evento.page.html',
  styleUrls: ['./confirmar-evento.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
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
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonToggle,
    IonMenu,
    IonMenuButton,
    IonSpinner,
    IonText
  ]
})

export class ConfirmarEventoPage implements OnInit {

  public reserva: any = null;
  public isLoading = false;
  public error: any = null;
  public userId: number | null = null;
  public workspace: any = null;
  public formError: string | null = null;
  public workspaceIds: number[] = [];
  public maxAttendees = 0;

  // Modelo del formulario enlazado con ngModel
  public form: {
    title: string;
    description?: string;
    start_datetime?: string;
    end_datetime?: string;
    created_by?: number;
    create_invitation?: boolean;
    attendees?: number;
  } = {
    title: '',
    description: undefined,
    start_datetime: undefined,
    end_datetime: undefined,
    created_by: undefined,
    create_invitation: false,
    attendees: 1
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private alertController: AlertController
  ) {

  }

  ngOnInit(): void {

    this.reserva = this.router.getCurrentNavigation()?.extras.state?.['reserva'];

    // Obtener workspaceIds de la navegación
    const navigation = this.router.getCurrentNavigation();
    const navState = navigation?.extras?.state ?? (history && (history.state || {}));
    this.workspaceIds = navState['workspaceIds'] ?? [];

    // Intentar obtener user id desde sessionStorage. Se aceptan dos formas: 'user' (JSON) o 'userId' (string)
    try {
      const userRaw = sessionStorage.getItem('user');
      if (userRaw) {
        const parsed = JSON.parse(userRaw);
        this.userId = parsed?.id ?? parsed?.userId ?? null;
      }
      if (!this.userId) {
        const alt = sessionStorage.getItem('userId');
        if (alt) this.userId = +alt;
      }
    } catch (err) {
      // no podemos parsear, intentar fallback
      const alt = sessionStorage.getItem('userId');
      if (alt) this.userId = +alt;
    }

    // Prefill start/end datetimes from reserva if vienen listos
    if (this.reserva && this.reserva.fecha && this.reserva.hora) {
      const [year, month, day] = this.reserva.fecha.split('-').map((v: string) => +v);
      const [hourStr, minuteStr] = this.reserva.hora.split(':');
      const start = new Date(year, month - 1, day, +hourStr, +minuteStr);
      const duration = this.reserva.duracion ?? 30;
      // end = start + duration minutes
      const end = new Date(start.getTime() + duration * 60000);
      this.form.start_datetime = this.formatForBackend(start);
      this.form.end_datetime = this.formatForBackend(end);
    }

    // Prefill created_by from session user if available
    if (this.userId) {
      this.form.created_by = this.userId;
    } else {
      this.form.created_by = 1;
    }

    // Load workspace details to calculate max attendees
    this.loadWorkspaceDetails();
  }

  /** Carga detalles de espacios y calcula el aforo máximo total */
  private loadWorkspaceDetails(): void {
    if (!this.workspaceIds || this.workspaceIds.length === 0) {
      this.maxAttendees = 0;
      return;
    }

    let totalOccupancy = 0;
    let pending = this.workspaceIds.length;

    this.workspaceIds.forEach(id => {
      this.apiService.getWorkspaceById(id).subscribe({
        next: (workspace) => {
          totalOccupancy += workspace.max_occupancy ?? 0;
          pending--;
          if (pending === 0) {
            this.maxAttendees = totalOccupancy;
            console.log('Max attendees calculado:', this.maxAttendees);
          }
        },
        error: (err) => {
          console.error(`Error cargando workspace ${id}:`, err);
          pending--;
        }
      });
    });
  }

  isFormValid(): boolean {
    // Required: title, start and end datetimes, attendees must be valid
    if (!this.form.title || this.form.title.trim() === '') return false;
    if (!this.form.start_datetime || !this.form.end_datetime) return false;
    if (!this.form.attendees || this.form.attendees < 1 || this.form.attendees > this.maxAttendees) return false;
    return true;
  }

  private formatForBackend(dt: Date) {
    // Formato ISO: YYYY-MM-DDTHH:MM:SS (ej: 2024-11-10T12:00:00)
    const y = dt.getFullYear();
    const m = (dt.getMonth() + 1).toString().padStart(2, '0');
    const d = dt.getDate().toString().padStart(2, '0');
    const hh = dt.getHours().toString().padStart(2, '0');
    const mm = dt.getMinutes().toString().padStart(2, '0');
    const ss = dt.getSeconds().toString().padStart(2, '0');
    return `${y}-${m}-${d}T${hh}:${mm}:${ss}`;
  }

  submitSolicitud() {
    // Validación antes de construir payload
    this.formError = null;
    if (!this.isFormValid()) {
      this.formError = 'Por favor complete el título, número de asistentes y verifique las fechas de reserva.';
      return;
    }

    // Mostrar alerta de confirmación
    this.showConfirmationAlert();
  }

  /** Muestra alerta de confirmación antes de enviar */
  private async showConfirmationAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirmar Agendamiento',
      message: `¿Deseas crear este evento?\n\nTítulo: ${this.form.title}\nAsistentes: ${this.form.attendees}\nFecha: ${this.form.start_datetime}`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Agendamiento cancelado');
          }
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.sendEventoRequest();
          }
        }
      ]
    });

    await alert.present();
  }

  /** Envía la solicitud del evento al backend */
  private sendEventoRequest() {
    const startIso = this.form.start_datetime!;
    const endIso = this.form.end_datetime!;

    const payload: any = {
      title: this.form.title,
      start_datetime: startIso,
      end_datetime: endIso,
      created_by: this.form.created_by ?? this.userId ?? 1,
      create_invitation: !!this.form.create_invitation,
      detail: {
        attendees: this.form.attendees ?? 1,
        description: this.form.description ?? ''
      },
      spaces: this.workspaceIds && this.workspaceIds.length > 0 ? this.workspaceIds : [1]
    };

    console.log('Payload preparado para enviar (evento):', payload);
    this.isLoading = true;
    this.apiService.creeateEvent(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Evento creado', res);
        try {
          this.router.navigate(['/confirmacion-realizada'], { state: { event: res} });
        } catch (e) {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al crear evento:', err);
        this.error = err;
      }
    });
  }

}
