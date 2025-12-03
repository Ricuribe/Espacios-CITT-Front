import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, 
  IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonItem, IonLabel, 
  IonInput, IonTextarea, IonDatetime, IonButton, IonIcon, IonSpinner, 
  IonToggle, ToastController, LoadingController, IonSegment, IonSegmentButton,
  IonDatetimeButton, IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  saveOutline, calendarOutline, timeOutline, textOutline, 
  peopleOutline, arrowBackOutline, documentTextOutline
} from 'ionicons/icons';

import { ApiService } from 'src/app/service/http-client';
import { FooterComponent } from 'src/app/components/footer/footer.component';

@Component({
  selector: 'app-editar-evento',
  templateUrl: './editar-evento.page.html',
  styleUrls: ['./editar-evento.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    FooterComponent,
    RouterLink,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, 
    IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonItem, IonLabel, 
    IonInput, IonTextarea, IonDatetime, IonButton, IonIcon, IonSpinner, 
    IonToggle, IonSegment, IonSegmentButton,
    IonDatetimeButton, IonModal
  ]
})
export class EditarEventoPage implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  public isLoading = true;
  public eventId: number | null = null;

  public eventData: any = {
    title: '',
    event_type: '',
    description: '',
    attendees: 1,
    start_date: '',
    start_time: '',
    end_time: '',
    create_invitation: false
  };

  constructor() {
    addIcons({ 
      saveOutline, calendarOutline, timeOutline, textOutline, 
      peopleOutline, arrowBackOutline, documentTextOutline
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventId = Number(id);
      this.loadEventData(this.eventId);
    } else {
      this.presentToast('ID de evento inválido', 'danger');
      this.router.navigate(['/gestionar-eventos']); 
    }
  }

  loadEventData(id: number) {
    this.isLoading = true;
    this.api.getManagementEventById(id).subscribe({
      next: (res: any) => {
        const detail = res.detail || {};
        const startIso = res.start_datetime;
        const endIso = res.end_datetime;

        this.eventData = {
          title: res.title,
          event_type: detail.event_type || '',
          description: detail.description || '',
          attendees: detail.attendees || 1,
          start_date: startIso, 
          start_time: startIso,
          end_time: endIso,
          create_invitation: res.form_public_link ? true : false 
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar evento:', err);
        this.presentToast('No se pudo cargar la información del evento', 'danger');
        this.isLoading = false;
      }
    });
  }

  async saveChanges() {
    if (!this.eventId) return;

    // --- VALIDACIONES ---

    // 1. Título
    if (!this.eventData.title.trim()) {
      return this.presentToast('El título es obligatorio', 'warning');
    }
    if (this.eventData.title.length > 150) {
      return this.presentToast('El título no puede exceder los 150 caracteres', 'warning');
    }

    // 2. Tipo de Evento (NUEVA VALIDACIÓN)
    if (!this.eventData.event_type.trim()) {
      return this.presentToast('El tipo de evento es obligatorio', 'warning');
    }
    if (this.eventData.event_type.length > 50) {
      return this.presentToast('El tipo de evento no puede exceder los 50 caracteres', 'warning');
    }

    // 3. Descripción
    if (!this.eventData.description.trim()) {
      return this.presentToast('La descripción es obligatoria', 'warning');
    }
    if (this.eventData.description.length > 2000) {
      return this.presentToast('La descripción no puede exceder los 2000 caracteres', 'warning');
    }

    // 4. Asistentes
    const attendees = Number(this.eventData.attendees);
    if (!attendees || attendees < 1 || attendees > 50) {
      return this.presentToast('Los asistentes deben ser entre 1 y 50 personas', 'warning');
    }

    // --- MANEJO DE FECHAS ---

    const baseDate = this.eventData.start_date.split('T')[0];
    const startTimePart = this.getTimeFromIso(this.eventData.start_time);
    const endTimePart = this.getTimeFromIso(this.eventData.end_time);

    const startObj = new Date(`${baseDate}T${startTimePart}:00`);
    const endObj = new Date(`${baseDate}T${endTimePart}:00`);

    if (endObj <= startObj) {
      return this.presentToast('La hora de término debe ser mayor a la de inicio', 'warning');
    }

    // Restamos 1 minuto (60000 ms) a la hora de término
    const adjustedEndObj = new Date(endObj.getTime() - 60000);

    const fullStart = this.formatDateLocal(startObj);
    const fullEnd = this.formatDateLocal(adjustedEndObj);

    const loader = await this.loadingCtrl.create({ message: 'Guardando cambios...' });
    await loader.present();

    const payload = {
      title: this.eventData.title,
      start_datetime: fullStart,
      end_datetime: fullEnd,
      
      detail: {
        event_type: this.eventData.event_type,
        description: this.eventData.description,
        attendees: attendees
      }
    };

    console.log('Enviando actualización:', payload);

    this.api.updateManagementEvent(this.eventId, payload).subscribe({
      next: () => {
        loader.dismiss();
        this.presentToast('Evento actualizado correctamente', 'success');
        this.router.navigate(['/gestionar-eventos']);
      },
      error: (err) => {
        loader.dismiss();
        console.error('Error update:', err);
        this.presentToast('Error al guardar los cambios', 'danger');
      }
    });
  }

  private getTimeFromIso(isoString: string): string {
    if (!isoString) return '00:00';
    if (isoString.includes('T')) {
      return isoString.split('T')[1].substring(0, 5);
    }
    return isoString.substring(0, 5); 
  }

  private formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message, duration: 2000, color, position: 'bottom'
    });
    toast.present();
  }
}