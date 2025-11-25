import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonMenuButton, 
  IonTitle, IonCard, IonIcon, IonChip, IonLabel, IonSegment, IonSegmentButton,
  IonSpinner, IonBackButton, AlertController, ToastController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, timeOutline, chevronDownOutline, chevronUpOutline, 
  createOutline, checkmarkCircleOutline, closeCircleOutline, calendarNumberOutline 
} from 'ionicons/icons';
import { ApiService } from 'src/app/service/http-client';

@Component({
  selector: 'app-gestionar-eventos',
  templateUrl: './gestionar-eventos.page.html',
  styleUrls: ['./gestionar-eventos.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonButtons, 
    IonButton, IonMenuButton, IonTitle, IonCard, IonIcon, IonChip, IonLabel, 
    IonSegment, IonSegmentButton, IonSpinner, IonBackButton
  ]
})
export class GestionarEventosPage implements OnInit {
  
  private api = inject(ApiService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  public events = signal<any[]>([]);
  public isLoading = signal<boolean>(false);
  public expandedId = signal<number | null>(null);
  public statusFilter = 'all'; // all, pending, confirmed

  // STATUS CONSTANTS (Adaptar según backend models.py)
  // 1: Agendado (Pendiente), 2: Confirmado, 3: En Curso, 4: Finalizado, 5: Cancelado/Rechazado
  readonly STATUS_PENDING = 1;
  readonly STATUS_CONFIRMED = 2;
  readonly STATUS_CANCELLED = 5;

  constructor() {
    addIcons({ calendarOutline, timeOutline, chevronDownOutline, chevronUpOutline, createOutline, checkmarkCircleOutline, closeCircleOutline, calendarNumberOutline });
  }

  ngOnInit() {
    this.loadEvents();
  }

  ionViewWillEnter() {
    this.loadEvents(); // Recargar al volver de edición
  }

  loadEvents() {
    this.isLoading.set(true);
    // Podríamos pasar filtros al backend, aquí filtramos en memoria por simplicidad
    // si la lista no es gigante.
    this.api.getManagementEvents().subscribe({
      next: (resp: any) => {
        // Asumiendo que resp es un array o resp.results
        const data = Array.isArray(resp) ? resp : resp.results || [];
        this.events.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando eventos', err);
        this.presentToast('Error al cargar eventos', 'danger');
        this.isLoading.set(false);
      }
    });
  }

  // Filtro computado
  public filteredEvents = computed(() => {
    const all = this.events();
    if (this.statusFilter === 'all') return all;
    if (this.statusFilter === 'pending') return all.filter(e => e.status === this.STATUS_PENDING);
    if (this.statusFilter === 'confirmed') return all.filter(e => e.status === this.STATUS_CONFIRMED);
    return all;
  });

  toggleDetails(id: number) {
    if (this.expandedId() === id) {
      this.expandedId.set(null);
    } else {
      this.expandedId.set(id);
    }
  }

  goToEdit(id: number) {
    this.router.navigate(['/management/editar-evento', id]);
  }

  // === ACCIONES ===

  async confirmEvent(ev: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Evento',
      message: `¿Estás seguro de confirmar el evento "${ev.title}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => {
            this.changeStatus(ev.id, this.STATUS_CONFIRMED);
          }
        }
      ]
    });
    await alert.present();
  }

  async rejectEvent(ev: any) {
    const alert = await this.alertCtrl.create({
      header: 'Rechazar Evento',
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Razón del rechazo (opcional)'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Rechazar',
          role: 'destructive',
          handler: (data) => {
            this.changeStatus(ev.id, this.STATUS_CANCELLED, data.reason);
          }
        }
      ]
    });
    await alert.present();
  }

  changeStatus(id: number, status: number, comment?: string) {
    this.isLoading.set(true);
    this.api.patchManagementEventStatus(id, status, comment).subscribe({
      next: () => {
        this.presentToast(status === this.STATUS_CONFIRMED ? 'Evento confirmado' : 'Evento rechazado', 'success');
        this.loadEvents(); // Recargar lista
      },
      error: (err) => {
        this.presentToast('Error al actualizar estado', 'danger');
        this.isLoading.set(false);
      }
    });
  }

  // === HELPERS ===

  formatDate(iso: string) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatTime(iso: string) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }

  getStatusColor(status: number) {
    switch(status) {
      case 1: return 'status-pending'; // Amarillo
      case 2: return 'status-confirmed'; // Verde
      case 5: return 'status-cancelled'; // Rojo
      default: return 'status-default';
    }
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, color: color, duration: 2000, position: 'bottom' });
    t.present();
  }
}