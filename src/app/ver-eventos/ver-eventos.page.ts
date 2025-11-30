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
  alertCircleOutline, logInOutline
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
  
  // Filtro: true = Hoy, false = Próximos
  public filterToday = signal<boolean>(true); 

  constructor() {
    addIcons({ 
      calendarOutline, timeOutline, locationOutline, arrowForwardOutline, arrowBackOutline,
      personCircleOutline, logOutOutline, libraryOutline, folderOpenOutline, homeOutline,
      alertCircleOutline, logInOutline
    });
  }

  ngOnInit() {
    this.checkLogin();
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'menu-eventos');
    this.checkLogin();
    this.loadEvents(); 
  }

  checkLogin() {
    // Validamos si existe userId O si existe un token de acceso
    const userId = sessionStorage.getItem('userId');
    const token = sessionStorage.getItem('token') || sessionStorage.getItem('access'); 
    
    // Si hay cualquiera de los dos, asumimos que está logueado
    this.isLoggedIn.set(!!(userId || token));
    
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
   * FUNCIÓN NUEVA: Controla a dónde vuelve el usuario
   */
  irAtras() {
    if (this.isLoggedIn()) {
      // Si está logueado, vuelve a su panel de usuario
      this.router.navigate(['/inicio-usuario']);
    } else {
      // Si NO está logueado, vuelve a la portada pública
      this.router.navigate(['/home']);
    }
  }

  segmentChanged(event: any) {
    const value = event.detail.value;
    this.filterToday.set(value === 'today');
    this.loadEvents();
  }

  loadEvents() {
    this.isLoading.set(true);
    this.apiService.getScheduledEvents(this.filterToday()).subscribe({
      next: (response: any) => {
        if (response && response.events) {
          const mappedEvents = response.events.map((ev: any) => ({
            id: ev.id_event || ev.id,
            titulo: ev.title || 'Sin título',
            fecha: this.formatDate(ev.start_datetime),
            hora: this.formatTimeRange(ev.start_datetime, ev.end_datetime),
            descripcion: ev.description || 'Sin descripción disponible.',
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
      'https://images.unsplash.com/photo-1713918927999-6c1ddf8ffc84?q=80&w=880&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1603356033288-acfcb54801e6?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=880&auto=format&fit=crop'
    ];
    return images[Math.floor(Math.random() * images.length)];
  }
}