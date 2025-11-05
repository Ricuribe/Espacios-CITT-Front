import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // Importar RouterLink si usas [routerLink]
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonImg, IonButtons, IonButton, IonContent, IonGrid, IonRow, IonCol, IonIcon, IonList, IonItem, IonLabel, IonInput, IonTextarea,
// --- COMPONENTES DEL MENÚ ---
IonMenu, IonMenuButton, IonSpinner, IonText } from '@ionic/angular/standalone';
import { ApiService } from 'src/app/service/http-client';


@Component({
  selector: 'app-confirmar-solicitud',
  templateUrl: './confirmar-solicitud.page.html',
  styleUrls: ['./confirmar-solicitud.page.scss'],
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
    IonMenu,
    IonMenuButton,
    IonSpinner,
    IonText
]
})

export class ConfirmarSolicitudPage implements OnInit {

  public workspaceId: number | null = null;
  public workspace: any = null;
  public reserva: any = null;
  public isLoading = true;
  public error: any = null;
  public userId: number | null = null;

  // Modelo del formulario enlazado con ngModel
  public form: {
    title: string;
    team: string;
    attendees: number;
    project: string;
    description: string;
    duration: number; // minutos: 30,60,90
  } = {
    title: 'Reunión de planificación',
    team: 'Equipo Backend',
    attendees: 4,
    project: 'Plataforma de agendamiento',
    description: 'Definición de tareas y revisión de dependencias',
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
    this.workspaceId = this.reserva?.workspaceId || null
    this.cargarDetalleWorkspace()
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
  }

  private formatForBackend(dt: Date) {
    // Formato parecido al ejemplo: YYYY-MM-DDTHH:MM:00:00
    const y = dt.getFullYear();
    const m = (dt.getMonth() + 1).toString().padStart(2, '0');
    const d = dt.getDate().toString().padStart(2, '0');
    const hh = dt.getHours().toString().padStart(2, '0');
    const mm = dt.getMinutes().toString().padStart(2, '0');
    return `${y}-${m}-${d}T${hh}:${mm}:00:00`;
  }

  submitSolicitud() {
    if (!this.reserva || !this.reserva.fecha || !this.reserva.hora || !this.workspaceId) {
      console.error('Faltan datos de reserva (fecha/hora/espacio)');
      return;
    }

    // Usuario
    const user = this.userId ?? 1; // puede ser null por ahora

    // Construir start datetime a partir de fecha (YYYY-MM-DD) y hora (HH:MM)
    const [year, month, day] = this.reserva.fecha.split('-').map((v: string) => +v);
    const [hourStr, minuteStr] = this.reserva.hora.split(':');
    const start = new Date(year, month - 1, day, +hourStr, +minuteStr);

    // end = start + duration minutes - 1 minute
    const duration = this.form.duration ?? this.reserva.duracion ?? 30;
    const end = new Date(start.getTime() + duration * 60000 - 60000);

    const payload = {
      user: user,
      title: this.form.title,
      start_time: this.formatForBackend(start),
      end_time: this.formatForBackend(end),
      workspace: +this.workspaceId,
      status: 1,
      detail: {
        team: this.form.team,
        attendees: this.form.attendees,
        project: this.form.project,
        description: this.form.description
      }
    };

    console.log('Payload preparado para enviar:', payload);

    this.isLoading = true;
    this.apiService.createSchedule(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Reserva creada', res);
        // Navegar a la página de confirmación realizada si existe
        try {
          this.router.navigate(['/confirmacion-realizada'], { state: { reserva: payload } });
        } catch (e) {
          // fallback: volver al inicio
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al crear reserva:', err);
        this.error = err;
      }
    });
  }

  cargarDetalleWorkspace() {
    this.isLoading = true;
    this.error = null;

    const idParam = this.workspaceId;

    if (idParam) {
      const id = +idParam; 
      this.apiService.getWorkspaceById(id).subscribe({
        next: (data) => {
          this.workspace = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err;
          this.isLoading = false;
          console.error('Error al cargar detalle:', err);
        }
      });
    } else {
      this.isLoading = false;
      this.error = { message: 'No se proporcionó un ID de espacio.' };
    }
  }

}

