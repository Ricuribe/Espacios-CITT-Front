import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonMenuButton, 
  IonImg, IonMenu, IonTitle, IonList, IonItem, IonLabel, IonIcon,
  MenuController, IonChip, IonAvatar, IonSegment, IonSegmentButton, IonSpinner, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, timeOutline, locationOutline, arrowForwardOutline, arrowBackOutline,
  personCircleOutline, logOutOutline, libraryOutline, folderOpenOutline, homeOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { FooterComponent } from '../components/footer/footer.component';
import { ApiService } from 'src/app/service/http-client'; 

@Component({
  selector: 'app-ver-eventos',
  templateUrl: './ver-eventos.page.html',
  styleUrls: ['./ver-eventos.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink, FooterComponent,
    IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonMenuButton, 
    IonImg, IonMenu, IonTitle, IonList, IonItem, IonLabel, IonIcon,
    IonChip, IonAvatar, IonSegment, IonSegmentButton, IonSpinner, IonText
  ]
})
export class VerEventosPage implements OnInit {
  
  private menuCtrl = inject(MenuController);
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Estado de usuario
  public isLoggedIn = signal<boolean>(false); 
  public userName = signal<string>('');

  // Estado de eventos
  public eventos = signal<any[]>([]);
  public isLoading = signal<boolean>(false);
  
  // CAMBIO AQUÍ: Inicializamos en 'true' para que "Eventos de Hoy" sea el default
  public filterToday = signal<boolean>(true); 

  constructor() {
    addIcons({ 
      calendarOutline, timeOutline, locationOutline, arrowForwardOutline, arrowBackOutline,
      personCircleOutline, logOutOutline, libraryOutline, folderOpenOutline, homeOutline,
      alertCircleOutline
    });
  }

  ngOnInit() {
    this.checkLogin();
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'menu-eventos');
    this.checkLogin();
    this.loadEvents(); // Cargar eventos al entrar
  }

  checkLogin() {
    const userId = sessionStorage.getItem('userId');
    this.isLoggedIn.set(!!userId);
    
    if (userId) {
      const name = sessionStorage.getItem('userFirstName');
      const last = sessionStorage.getItem('userLastName');
      if (name) this.userName.set(`${name} ${last || ''}`);
    }
  }

  logout() {
    sessionStorage.clear();
    this.isLoggedIn.set(false);
    this.userName.set('');
    this.router.navigate(['/home']);
  }

  /**
   * Cambia el filtro entre 'hoy' y 'futuros'
   */
  segmentChanged(event: any) {
    const value = event.detail.value;
    // Si el valor es 'today', filterToday pasa a true. Si es 'future', pasa a false.
    this.filterToday.set(value === 'today');
    this.loadEvents();
  }

  loadEvents() {
    this.isLoading.set(true);
    // Llamada al endpoint con el parámetro today (true/false)
    this.apiService.getScheduledEvents(this.filterToday()).subscribe({
      next: (response: any) => {
        if (response && response.events) {
          // Mapeamos la respuesta del backend al formato que usa la vista
          const mappedEvents = response.events.map((ev: any) => ({
            id: ev.id_event || ev.id,
            titulo: ev.title || 'Sin título',
            fecha: this.formatDate(ev.start_datetime),
            hora: this.formatTimeRange(ev.start_datetime, ev.end_datetime),
            descripcion: ev.description || 'Sin descripción disponible.',
            // Si el backend no devuelve imagen, usamos una por defecto o aleatoria
            imagen: ev.image || this.getRandomImage(), 
            categoria: ev.event_type_label || 'Evento'
          }));
          this.eventos.set(mappedEvents);
        } else {
          this.eventos.set([]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando eventos:', err);
        this.eventos.set([]); 
        this.isLoading.set(false);
      }
    });
  }

  // --- Utilidades de Formato ---

  private formatDate(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  }

  private formatTimeRange(startIso: string, endIso: string): string {
    if (!startIso || !endIso) return '';
    const start = new Date(startIso);
    const end = new Date(endIso);
    const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const sTime = new Intl.DateTimeFormat('en-US', opts).format(start);
    const eTime = new Intl.DateTimeFormat('en-US', opts).format(end);
    return `${sTime} - ${eTime}`;
  }

  private getRandomImage(): string {
    const images = [
      'https://images.unsplash.com/photo-1713918927999-6c1ddf8ffc84?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1603356033288-acfcb54801e6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cm9iJUMzJUIzdGljYXxlbnwwfDJ8MHx8fDA%3D',
      'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    ];
    return images[Math.floor(Math.random() * images.length)];
  }
}