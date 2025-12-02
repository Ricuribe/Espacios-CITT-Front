import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonButtons, IonMenuButton, IonImg, IonTitle, 
  IonContent, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonCard, 
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, 
  IonItem, IonLabel, IonInput, IonTextarea, IonMenu, IonSkeletonText, 
  IonText, IonChip, IonAvatar, AlertController, MenuController, IonToggle,
  ToastController, 
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, calendarOutline, timeOutline, 
  peopleOutline, checkmarkCircleOutline, documentTextOutline,
  personCircleOutline, logOutOutline, homeOutline, folderOpenOutline, libraryOutline
} from 'ionicons/icons';

import { ApiService } from 'src/app/service/http-client';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { StorageService } from 'src/app/service/storage.service'; 

@Component({
  selector: 'app-confirmar-evento',
  templateUrl: './confirmar-evento.page.html',
  styleUrls: ['./confirmar-evento.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, FooterComponent,
    IonHeader, IonToolbar, IonButtons, IonMenuButton, IonImg, IonTitle, 
    IonContent, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonCard, 
    IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, 
    IonItem, IonLabel, IonInput, IonTextarea, IonMenu, IonSkeletonText, 
    IonText, IonChip, IonAvatar, IonToggle,
    IonSpinner
  ]
})
export class ConfirmarEventoPage implements OnInit {

  public router = inject(Router);
  private apiService = inject(ApiService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private menuCtrl = inject(MenuController);
  private storageService = inject(StorageService); 

  public reserva: any = null;
  public workspaceIds: number[] = []; 
  public isLoading = false;
  public userName: string = '';
  public maxAttendees = 0; 
  public userId: number | null = null;

  public form = {
    title: '',
    event_type: '', // Campo de texto libre
    description: '',
    attendees: 1,
    create_invitation: false 
  };

  constructor() {
    addIcons({ 
      arrowBackOutline, calendarOutline, timeOutline, 
      peopleOutline, checkmarkCircleOutline, documentTextOutline,
      personCircleOutline, logOutOutline, homeOutline, folderOpenOutline, libraryOutline
    });
  }

  async ngOnInit() {
    await this.loadSessionData();
    
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;

    if (state && state.reserva) {
      this.reserva = state.reserva;
      this.workspaceIds = (state.workspaceIds || []).map((id: any) => Number(id));
      this.loadWorkspaceDetails();
    } else {
      this.reserva = {
        fecha: new Date().toISOString(),
        hora: '10:00',
        duracion: 60
      };
    }
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'menu-confirmar');
  }

  async loadSessionData() {
    try {
      const user = await this.storageService.getUser(); 
      if (user) {
        this.userId = user.id;
        this.userName = `${user.first_name} ${user.last_name || ''}`;
      }
    } catch (e) {
      console.error('Error cargando usuario:', e);
    }
  }

  private loadWorkspaceDetails(): void {
    if (!this.workspaceIds || this.workspaceIds.length === 0) {
      this.maxAttendees = 0;
      return;
    }

    let totalOccupancy = 0;
    if(this.workspaceIds.length === 1 && this.workspaceIds[0] === 1) {
        this.maxAttendees = 50; 
        return;
    }

    this.workspaceIds.forEach(id => {
      this.apiService.getWorkspaceById(id).subscribe({
        next: (ws) => {
          totalOccupancy += ws.max_occupancy ?? 0;
          this.maxAttendees = totalOccupancy;
        },
        error: (err) => console.error(`Error cargando espacio ${id}`, err)
      });
    });
  }

  async confirmarFinal() {
    if (!this.form.title.trim()) {
      this.presentToast('El título es obligatorio', 'warning');
      return;
    }

    // Validación de texto simple
    if (!this.form.event_type.trim()) {
      this.presentToast('El tipo de evento es obligatorio', 'warning');
      return;
    }

    if (!this.form.description.trim()) {
      this.presentToast('La descripción del evento es obligatoria', 'warning');
      return;
    }

    if (!this.form.attendees || this.form.attendees < 1 || !Number.isInteger(this.form.attendees)) {
      this.presentToast('La cantidad de asistentes debe ser un número válido (mínimo 1)', 'warning');
      return;
    }

    if (this.maxAttendees > 0 && this.form.attendees > this.maxAttendees) {
      this.presentToast(`El aforo máximo es de ${this.maxAttendees} personas`, 'warning');
      return;
    }

    if (!this.userId) {
      this.presentToast('Error de sesión. Por favor vuelve a ingresar.', 'danger');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Evento',
      message: `¿Crear el evento "${this.form.title}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Sí, Crear', 
          handler: () => this.enviarSolicitud() 
        }
      ]
    });
    await alert.present();
  }

  private enviarSolicitud() {
    this.isLoading = true;

    const startDateTime = this.combinarFechaHora(this.reserva.fecha, this.reserva.hora);
    const endDateTime = this.calcularFin(this.reserva.fecha, this.reserva.hora, this.reserva.duracion);

    const payload = {
      title: this.form.title,
      start_datetime: startDateTime,
      end_datetime: endDateTime,
      created_by: this.userId,
      create_invitation: this.form.create_invitation, 
      
      detail: {
        attendees: this.form.attendees,
        description: this.form.description,
        event_type: this.form.event_type 
      },
      
      spaces: this.workspaceIds.length > 0 ? this.workspaceIds : [1] 
    };

    console.log('Enviando Payload:', payload);

    this.apiService.creeateEvent(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.presentToast('Evento creado exitosamente', 'success');
        
        this.router.navigate(['/confirmacion-realizada'], { 
          state: { 
            event: res,
            status: 'event_created'
          } 
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        const msg = err.error?.error || 'No se pudo crear el evento.';
        this.presentToast(msg, 'danger');
      }
    });
  }

  private combinarFechaHora(fechaIso: string, horaStr: string): string {
    const datePart = fechaIso.split('T')[0];
    return `${datePart}T${horaStr}:00`;
  }

  private calcularFin(fechaIso: string, horaStr: string, duracionMin: number): string {
    const inicio = new Date(this.combinarFechaHora(fechaIso, horaStr));
    const fin = new Date(inicio.getTime() + duracionMin * 60000);
    return fin.toISOString().split('.')[0];
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message, duration: 2000, color, position: 'bottom'
    });
    toast.present();
  }

  volver() {
    this.router.navigate(['/evento-agendar']);
  }

  async logout() {
    await this.storageService.clearSession();
    this.router.navigate(['/home']);
  }
}