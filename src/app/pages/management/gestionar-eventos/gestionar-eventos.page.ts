import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // Agregado RouterLink
import { 
  IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonMenuButton, 
  IonTitle, IonCard, IonIcon, IonChip, IonLabel, IonSegment, IonSegmentButton,
  IonSpinner, IonBackButton, AlertController, ToastController,
  IonImg, IonMenu // Agregados para header estándar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, timeOutline, chevronDownOutline, chevronUpOutline, 
  createOutline, checkmarkCircleOutline, closeCircleOutline, calendarNumberOutline,
  pencilOutline, trashOutline, arrowBackOutline // Nuevos iconos para el diseño
} from 'ionicons/icons';
import { ApiService } from 'src/app/service/http-client';
import { FooterComponent } from 'src/app/components/footer/footer.component'; // Footer

@Component({
  selector: 'app-gestionar-eventos',
  templateUrl: './gestionar-eventos.page.html',
  styleUrls: ['./gestionar-eventos.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, FooterComponent,
    IonContent, IonHeader, IonToolbar, IonButtons, 
    IonButton, IonMenuButton, IonTitle, IonCard, IonIcon, IonChip, IonLabel, 
    IonSegment, IonSegmentButton, IonSpinner, IonBackButton, IonImg, IonMenu
  ]
})
export class GestionarEventosPage implements OnInit {
  
  private api = inject(ApiService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  public events = signal<any[]>([]);
  public isLoading = signal<boolean>(false);
  public statusFilter = 'all'; 

  readonly STATUS_PENDING = 1;
  readonly STATUS_CONFIRMED = 2;
  readonly STATUS_CANCELLED = 5;

  constructor() {
    addIcons({ 
      calendarOutline, timeOutline, chevronDownOutline, chevronUpOutline, 
      createOutline, checkmarkCircleOutline, closeCircleOutline, calendarNumberOutline,
      pencilOutline, trashOutline, arrowBackOutline
    });
  }

  ngOnInit() {
    this.loadEvents();
  }

  ionViewWillEnter() {
    this.loadEvents();
  }

  loadEvents() {
    this.isLoading.set(true);
    this.api.getEvents().subscribe({ // Asegúrate que este método traiga los eventos de gestión
      next: (resp: any) => {
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

  public filteredEvents = computed(() => {
    const all = this.events();
    if (this.statusFilter === 'all') return all;
    if (this.statusFilter === 'pending') return all.filter(e => e.status === this.STATUS_PENDING);
    if (this.statusFilter === 'confirmed') return all.filter(e => e.status === this.STATUS_CONFIRMED);
    return all;
  });

  goToEdit(id: number) {
    this.router.navigate(['/management/editar-evento', id]);
  }

  // Función para eliminar (usando el icono de basura del mockup)
  async deleteEvent(ev: any) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Evento',
      message: `¿Estás seguro de eliminar "${ev.title}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Eliminar', role: 'destructive',
          handler: () => this.changeStatus(ev.id, this.STATUS_CANCELLED) // O lógica de borrado real
        }
      ]
    });
    await alert.present();
  }

  changeStatus(id: number, status: number, comment?: string) {
    this.isLoading.set(true);
    // Simulación de llamada o usa tu método real updateScheduleStatus o similar
    // this.api.updateEventStatus(...) 
    setTimeout(() => {
        this.presentToast('Estado actualizado', 'success');
        this.isLoading.set(false);
        this.loadEvents(); // Recargar
    }, 1000);
  }

  formatDate(iso: string) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatTime(iso: string) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, color: color, duration: 2000, position: 'bottom' });
    t.present();
  }
}