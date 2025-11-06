import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // Importar RouterLink si usas [routerLink]
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonImg, IonButtons, IonButton, IonContent, IonGrid, IonRow, IonCol, IonIcon, IonList, IonItem, IonLabel, IonInput, IonTextarea,
IonMenu, IonMenuButton, IonSpinner, IonText, IonSelect, IonSelectOption, IonToggle,
// Card components
IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/angular/standalone';
import { ApiService } from 'src/app/service/http-client';

@Component({
  selector: 'app-confirmar-evento',
  templateUrl: './confirmar-evento.page.html',
  styleUrls: ['./confirmar-evento.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
  NgIf,
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
  IonSelect,
  IonSelectOption,
  IonToggle,
    IonMenu,
    IonMenuButton,
    IonSpinner,
    IonText
    ,
    // Card components
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent
]
})

export class ConfirmarEventoPage implements OnInit {

  public reserva: any = null;
  public isLoading = false;
  public error: any = null;
  public userId: number | null = null;
  public workspace: any = null;
  public formError: string | null = null;

  // Modelo del formulario enlazado con ngModel
  public form: {
    title: string;
    event_type?: string;
    description?: string;
    start_datetime?: string;
    end_datetime?: string;
    created_by?: number;
    create_invitation?: boolean;

    // legacy / optional workspace fields left for backward compatibility
    team?: string;
    attendees?: number;
    project?: string;
    duration?: number; // minutos: 30,60,90
  } = {
    title: '',
    event_type: undefined,
    description: undefined,
    start_datetime: undefined,
    end_datetime: undefined,
    created_by: undefined,
    create_invitation: false,
    team: '',
    attendees: 0,
    project: '',
    duration: 30
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {

  }

  ngOnInit(): void {

    this.reserva = this.router.getCurrentNavigation()?.extras.state?.['reserva'];
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

    // Si la reserva viene con duracion, úsala para prellenar
    if (this.reserva?.duracion) {
      this.form.duration = this.reserva.duracion;
    }

    // Prefill start/end datetimes from reserva if vienen listos
    if (this.reserva && this.reserva.fecha && this.reserva.hora) {
      const [year, month, day] = this.reserva.fecha.split('-').map((v: string) => +v);
      const [hourStr, minuteStr] = this.reserva.hora.split(':');
      const start = new Date(year, month - 1, day, +hourStr, +minuteStr);
      const duration = this.form.duration ?? this.reserva.duracion ?? 30;
        // end = start + duration minutes - 1 minute (consistente con confirmar-solicitud)
        const end = new Date(start.getTime() + duration * 60000 - 60000);
      this.form.start_datetime = this.formatForBackend(start);
      this.form.end_datetime = this.formatForBackend(end);
    }

    // Prefill created_by from session user if available
    if (this.userId) {
      this.form.created_by = this.userId;
    } else {
      this.form.created_by = 1;
    }
  }

  isFormValid(): boolean {
    // Required: title, event_type, start and end datetimes
    if (!this.form.title || this.form.title.trim() === '') return false;
    if (!this.form.event_type || this.form.event_type.trim() === '') return false;
    if (!this.form.start_datetime || !this.form.end_datetime) return false;
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
      this.formError = 'Por favor complete el título, el tipo de evento y verifique las fechas de reserva.';
      return;
    }

    const startIso = this.form.start_datetime!;
    const endIso = this.form.end_datetime!;

    const payload: any = {
      title: this.form.title,
      event_type: this.form.event_type ?? 'Evento Academico',
      description: this.form.description ?? '',
      start_datetime: startIso,
      end_datetime: endIso,
      created_by: this.form.created_by ?? this.userId ?? 1,
      create_invitation: !!this.form.create_invitation
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
