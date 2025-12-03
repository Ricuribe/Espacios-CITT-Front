import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonMenuButton, 
  IonImg, IonMenu, IonTitle, IonList, IonItem, IonLabel, IonIcon,
  MenuController, IonChip, IonAvatar, IonSegment, IonSegmentButton, IonSpinner, IonText
} from '@ionic/angular/standalone';
import { QRCodeComponent } from 'angularx-qrcode';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, timeOutline, locationOutline, arrowForwardOutline, arrowBackOutline,
  personCircleOutline, logOutOutline, libraryOutline, folderOpenOutline, homeOutline,
  alertCircleOutline, logInOutline, mailOutline, linkOutline, qrCodeOutline,
  chevronDownOutline, chevronUpOutline
} from 'ionicons/icons';

import { FooterComponent } from '../components/footer/footer.component';
import { ApiService } from 'src/app/service/http-client'; 
import { AuthService } from 'src/app/service/auth.service';
import { StorageService } from 'src/app/service/storage.service';

@Component({
  selector: 'app-ver-eventos',
  templateUrl: './ver-eventos.page.html',
  styleUrls: ['./ver-eventos.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink, FooterComponent, QRCodeComponent,
    IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonMenuButton, 
    IonImg, IonMenu, IonTitle, IonList, IonItem, IonLabel, IonIcon,
    IonChip, IonAvatar, IonSegment, IonSegmentButton, IonSpinner, IonText
  ]
})
export class VerEventosPage implements OnInit {

  private api = inject(ApiService);
  private authService = inject(AuthService);
  private storage = inject(StorageService);
  private router = inject(Router);

  // Datos
  public eventos = signal<any[]>([]);
  public isLoading = signal<boolean>(false);
  
  // Estado de UI
  public expandedEventId = signal<number | null>(null);
  public filterToday = signal<boolean>(false); // false = Todos, true = Hoy

  // Sesión
  public isLoggedIn = signal<boolean>(false);
  public userName = signal<string>('');

  constructor() {
    addIcons({ 
      calendarOutline, timeOutline, locationOutline, arrowForwardOutline, arrowBackOutline,
      personCircleOutline, logOutOutline, libraryOutline, folderOpenOutline, homeOutline,
      alertCircleOutline, logInOutline, mailOutline, linkOutline, qrCodeOutline,
      chevronDownOutline, chevronUpOutline
    });
  }

  ngOnInit() {
    this.checkSession();
    this.loadEvents();
  }

  checkSession() {
    this.authService.isAuthenticated$.subscribe(auth => {
      this.isLoggedIn.set(auth);
      if (auth) {
        this.storage.getUser().then(user => {
          if (user) this.userName.set(`${user.first_name} ${user.last_name || ''}`);
        });
      }
    });
  }

  // Lógica Botón Volver
  goBack() {
    if (this.isLoggedIn()) {
      this.router.navigate(['/inicio-usuario']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  // Carga de Eventos (Pasando el filtro explícitamente)
  loadEvents(event?: any) {
    if (!event) this.isLoading.set(true);

    // Pasamos el valor del signal (true o false) al servicio
    this.api.getScheduledEvents(this.filterToday()).subscribe({
      next: (res: any) => {
        const lista = res.events || [];
        this.eventos.set(lista);
        this.isLoading.set(false);
        if (event) event.target.complete();
      },
      error: (err: any) => {
        console.error('Error cargando eventos:', err);
        this.isLoading.set(false);
        if (event) event.target.complete();
      }
    });
  }

  // Cambio de filtro desde el Segmento
  segmentChanged(ev: any) {
    const val = ev.detail.value;
    this.filterToday.set(val === 'today');
    this.eventos.set([]); // Limpiar visualmente
    this.loadEvents();
  }

  // Acordeón de tarjetas
  toggleExpand(id: number) {
    if (this.expandedEventId() === id) {
      this.expandedEventId.set(null);
    } else {
      this.expandedEventId.set(id);
    }
  }

  // Helpers de estado
  getStatusLabel(status: number): string {
    switch(status) {
      case 1: return 'Agendado';
      case 2: return 'Confirmado';
      case 3: return 'En Curso';
      case 4: return 'Realizado';
      case 0: return 'Cancelado';
      default: return 'Desconocido';
    }
  }

  getStatusColor(status: number): string {
    switch(status) {
      case 1: return 'warning'; 
      case 2: return 'success'; 
      case 0: return 'danger';  
      case 3: return 'primary'; 
      case 4: return 'medium';  
      default: return 'medium';
    }
  }

  openLink(url: string) {
    if (url) window.open(url, '_blank', 'noopener');
  }

  async logout() {
    await this.storage.clearSession();
    this.router.navigate(['/home']);
  }
}