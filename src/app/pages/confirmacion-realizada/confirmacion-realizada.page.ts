import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonImg, IonButtons, IonButton, IonContent, IonGrid, IonRow, IonCol, IonIcon, IonMenu, IonMenuButton, IonList, IonItem, IonLabel, IonText } from '@ionic/angular/standalone';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-confirmacion-realizada',
  templateUrl: './confirmacion-realizada.page.html',
  styleUrls: ['./confirmacion-realizada.page.scss'],
  standalone: true,
  
  imports: [
    CommonModule,
    RouterLink,
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
    IonText,
    QRCodeComponent
]
})
export class ConfirmacionRealizadaPage implements OnInit {
  
  public createdSchedule : any = null;
  private detail: any = null;
  public workspace: any = null;
  public eventData: any = null;
  public isEvent: boolean = false;
  public isWorkspace: boolean = false;
  public qrValue: string | null = null;
  public eventEditLink: string | null = null;
  public eventStartFormatted: string | null = null;
  public eventEndFormatted: string | null = null;
  public qrWidth: number = 200;
  public qrDownloadUrl: any = null;
  public date : string = '';
  public startHour: string = '';
  public endHour: string = '';


  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const { reserva, workspace, event, status } = this.retrieveResponse();

    // asignaciones
    this.createdSchedule = reserva;
    this.workspace = workspace;
    this.eventData = event;

    // normalizar status
    const st = (status ?? reserva?.status ?? event?.status ?? '').toString().toLowerCase();

    // detección: si contiene 'reserva' y hay workspace => reserva de espacio
    if ((st.includes('reserva') && workspace) || (workspace && reserva)) {
      this.isWorkspace = true;
      console.log('La reserva creada: ', this.createdSchedule);
      console.log('espacio:', this.workspace);
      if (this.createdSchedule?.schedule) {
        this.reorderData(this.createdSchedule.schedule.date_scheduled, this.createdSchedule.schedule.start_time, this.createdSchedule.schedule.end_time);
      }

    // si contiene 'event' o llega un objeto event => evento
    } else if (st.includes('event') || event) {
      this.isEvent = true;
      // asignar datos del evento
      const ev = this.eventData ?? event;
      this.eventData = ev ?? this.eventData;
      // asignar enlaces del formulario si existen
      this.eventEditLink = ev?.form_edit_link ? ev.form_edit_link : null;
      this.qrValue = ev?.form_public_link ? ev.form_public_link : null;

      // formatear fechas para mostrar
      try {
        if (ev?.start_datetime) {
          const dStart = new Date(ev.start_datetime);
          this.eventStartFormatted = dStart.toLocaleString('es-CL', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
        if (ev?.end_datetime) {
          const dEnd = new Date(ev.end_datetime);
          this.eventEndFormatted = dEnd.toLocaleString('es-CL', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
      } catch (e) {
        // fallback simple
        this.eventStartFormatted = ev?.start_datetime ?? null;
        this.eventEndFormatted = ev?.end_datetime ?? null;
      }

      // ajustar tamaño del QR según ancho de pantalla
      try {
        const w = window?.innerWidth ?? 800;
        // qr ocupa hasta 70% del ancho del contenedor, con max 300
        this.qrWidth = Math.min(300, Math.floor(w * 0.6));
      } catch (e) {
        this.qrWidth = 200;
      }

      console.log('Evento recibido:', ev ?? { status });
    } else {
      // Fallback: si no hay nada, intentar comportarse como reserva si existen los datos previos
      if (this.createdSchedule && this.workspace) {
        this.isWorkspace = true;
        if (this.createdSchedule?.schedule) {
          this.reorderData(this.createdSchedule.schedule.date_scheduled, this.createdSchedule.schedule.start_time, this.createdSchedule.schedule.end_time);
        }
      }
    }

  }

  onQrUrl(url: any) {
    // guardamos la url para permitir descarga futura si se desea
    this.qrDownloadUrl = url;
  }

  openEditLink() {
    if (this.eventEditLink) {
      window.open(this.eventEditLink, '_blank', 'noopener');
    }
  }

  retrieveResponse() {
    const state = this.router.getCurrentNavigation()?.extras.state || {};
    return {
      reserva: state['reserva'] ?? null,
      workspace: state['workspace'] ?? null,
      event: state['event'] ?? null,
      status: state['status'] ?? null
    };
  }

  reorderData(date : string, startTime : string, endTime: string) {
    this.date = date.split("-").reverse().join("-")
    this.startHour = startTime.split("T")[1].slice(0, 5);
    this.endHour = endTime.split("T")[1].slice(0, 5);

  }

}

