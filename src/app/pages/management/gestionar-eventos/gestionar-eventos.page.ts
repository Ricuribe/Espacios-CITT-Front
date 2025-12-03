import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonChip, IonIcon, IonRefresher, IonRefresherContent, IonSegment, IonSegmentButton, IonLabel, IonModal, IonButton, IonList, IonItem, IonNote, IonAvatar, IonText, IonSpinner, ToastController, AlertController, LoadingController, IonFooter } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, timeOutline, personOutline, filterOutline, 
  checkmarkCircleOutline, closeCircleOutline, createOutline, 
  eyeOutline, peopleOutline, documentTextOutline, alertCircleOutline
} from 'ionicons/icons';

import { ApiService } from 'src/app/service/http-client';
import { FooterComponent } from 'src/app/components/footer/footer.component';

@Component({
  selector: 'app-gestionar-eventos',
  templateUrl: './gestionar-eventos.page.html',
  styleUrls: ['./gestionar-eventos.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, FooterComponent,
    IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent,
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle,
    IonCardSubtitle, IonCardContent, IonChip, IonIcon, IonRefresher,
    IonRefresherContent, IonSegment, IonSegmentButton, IonLabel,
    IonModal, IonButton, IonList, IonItem, IonNote, IonAvatar, IonText,
    IonSpinner,
    IonFooter
]
})
export class GestionarEventosPage implements OnInit {

  private api = inject(ApiService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private loadingCtrl = inject(LoadingController);

  // Estados de carga y datos
  public events = signal<any[]>([]);
  public isLoading = signal<boolean>(false);
  
  public currentStatus = signal<string>('1');

  // Modal de Detalle
  public isModalOpen = false;
  public selectedEvent: any = null;
  public loadingDetail = false;

  constructor() {
    addIcons({ 
      calendarOutline, timeOutline, personOutline, filterOutline, 
      checkmarkCircleOutline, closeCircleOutline, createOutline, 
      eyeOutline, peopleOutline, documentTextOutline, alertCircleOutline
    });
  }

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents(event?: any) {
    if (!event) this.isLoading.set(true);

    const statusFilter = this.currentStatus() === 'all' ? undefined : Number(this.currentStatus());

    this.api.getManagementEvents({ status: statusFilter }).subscribe({
      next: (res: any) => {
        const lista = Array.isArray(res) ? res : (res.results || []);
        this.events.set(lista);
        this.isLoading.set(false);
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error('Error cargando eventos:', err);
        this.isLoading.set(false);
        if (event) event.target.complete();
      }
    });
  }

  segmentChanged(ev: any) {
    this.currentStatus.set(ev.detail.value);
    this.events.set([]); 
    this.loadEvents();
  }

  openDetail(eventSummary: any) {
    this.isModalOpen = true;
    this.loadingDetail = true;
    this.selectedEvent = null; 

    this.api.getManagementEventById(eventSummary.id_event).subscribe({
      next: (fullEvent) => {
        this.selectedEvent = fullEvent;
        this.loadingDetail = false;
      },
      error: (err) => {
        console.error('Error cargando detalle:', err);
        this.loadingDetail = false;
        this.presentToast('Error al cargar detalles', 'danger');
        this.closeModal();
      }
    });
  }

  closeModal() {
    this.isModalOpen = false;
    // Retraso para limpiar datos visualmente después de la animación
    setTimeout(() => {
        this.selectedEvent = null;
    }, 200);
  }

  /**
   * CORRECCIÓN: Esperar a que el modal cierre antes de navegar
   */
  editEvent() {
    if (!this.selectedEvent) return;
    
    // 1. Guardar ID
    const eventId = this.selectedEvent.id_event; 
    
    // 2. Cerrar Modal
    this.isModalOpen = false;
    
    // 3. Esperar animación (300ms) y LUEGO navegar
    setTimeout(() => {
      this.selectedEvent = null; // Limpieza
      this.router.navigate(['/editar-evento', eventId]);
    }, 300);
  }

  async confirmChangeStatus(newStatus: number) {
    const action = newStatus === 2 ? 'Confirmar' : 'Cancelar';
    
    const alert = await this.alertCtrl.create({
      header: `${action} Evento`,
      message: `¿Estás seguro de que deseas <strong>${action.toLowerCase()}</strong> este evento?`,
      buttons: [
        { text: 'Volver', role: 'cancel' },
        { 
          text: 'Sí, aplicar', 
          handler: () => this.executeStatusChange(newStatus) 
        }
      ]
    });
    await alert.present();
  }

  private async executeStatusChange(status: number) {
    if (!this.selectedEvent) return;

    const loader = await this.loadingCtrl.create({ message: 'Procesando...' });
    await loader.present();

    this.api.patchManagementEventStatus(this.selectedEvent.id_event, status).subscribe({
      next: () => {
        loader.dismiss();
        this.presentToast(`Estado actualizado correctamente`, 'success');
        this.closeModal();
        this.loadEvents(); 
      },
      error: (err) => {
        loader.dismiss();
        console.error(err);
        this.presentToast('Error al actualizar estado', 'danger');
      }
    });
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message, duration: 2000, color, position: 'bottom'
    });
    toast.present();
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 1: return 'warning'; 
      case 2: return 'success'; 
      case 0: return 'danger';  
      case 3: return 'primary'; 
      case 4: return 'medium';  
      default: return 'medium';
    }
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'Pendiente';
      case 2: return 'Confirmado';
      case 0: return 'Cancelado';
      case 3: return 'En Curso';
      case 4: return 'Realizado';
      case 5: return 'Rechazado';
      default: return 'Desc.';
    }
  }
}