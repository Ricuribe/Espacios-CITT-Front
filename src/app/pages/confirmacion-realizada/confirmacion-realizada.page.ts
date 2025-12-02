import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonImg, IonButtons, IonButton, 
  IonContent, IonGrid, IonRow, IonCol, IonIcon, IonMenu, IonMenuButton, 
  IonList, IonItem, IonLabel, IonText, IonChip, IonAvatar, MenuController,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle
} from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';
import { addIcons } from 'ionicons';
import { 
  homeOutline, folderOpenOutline, libraryOutline, logOutOutline,
  checkmarkCircleOutline, shareSocialOutline, downloadOutline, arrowBackOutline,
  calendarOutline, timeOutline, locationOutline
} from 'ionicons/icons';

import { StorageService } from 'src/app/service/storage.service';
import { FooterComponent } from 'src/app/components/footer/footer.component';

@Component({
  selector: 'app-confirmacion-realizada',
  templateUrl: './confirmacion-realizada.page.html',
  styleUrls: ['./confirmacion-realizada.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FooterComponent,
    QRCodeComponent,
    IonHeader, IonToolbar, IonTitle, IonImg, IonButtons, IonButton, 
    IonContent, IonGrid, IonRow, IonCol, IonIcon, IonMenu, IonMenuButton, 
    IonList, IonItem, IonLabel, IonText, IonChip, IonAvatar,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle
  ]
})
export class ConfirmacionRealizadaPage implements OnInit {
  
  // Inyecciones
  private router = inject(Router);
  private storageService = inject(StorageService);
  private menuCtrl = inject(MenuController);

  // Estado de Datos
  public createdSchedule : any = null;
  public workspace: any = null;
  public eventData: any = null;
  
  public isEvent: boolean = false;
  public isWorkspace: boolean = false;
  
  public qrValue: string = '';
  public qrWidth: number = 200; // Valor inicial seguro por defecto
  public qrDownloadUrl: string = '';
  
  public eventEditLink: string = '';

  // Estado de UI (Header)
  public userName: string = '';

  constructor() {
    addIcons({
      homeOutline, folderOpenOutline, libraryOutline, logOutOutline,
      checkmarkCircleOutline, shareSocialOutline, downloadOutline, arrowBackOutline,
      calendarOutline, timeOutline, locationOutline
    });
  }

  async ngOnInit() {
    await this.loadSessionData();
    this.procesarDatosRecibidos();
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'menu-confirmacion');
  }

  async loadSessionData() {
    try {
      const user = await this.storageService.getUser();
      if (user) {
        this.userName = `${user.first_name} ${user.last_name || ''}`;
      }
    } catch (e) {
      console.error('Error cargando sesión:', e);
    }
  }

  procesarDatosRecibidos() {
    const data = this.retrieveResponse();
    this.createdSchedule = data.reserva;
    this.workspace = data.workspace;
    this.eventData = data.event; 

    // --- CAMBIO AQUÍ: Lógica de tamaño más conservadora ---
    const w = window.innerWidth;
    // Si es pantalla pequeña (< 768px), usamos 200px fijo. 
    // Si es grande, 250px. Esto evita que se genere un canvas gigante.
    this.qrWidth = w < 768 ? 200 : 250;
    // ------------------------------------------------------

    // CASO 1: Es un Evento creado
    if (this.eventData) {
      this.isEvent = true;
      const ev = this.eventData; 
      
      console.log('Procesando evento para vista:', ev);

      if (ev.form_public_link) {
        this.qrValue = ev.form_public_link;
      }
      
      if (ev.form_edit_link) {
        this.eventEditLink = ev.form_edit_link;
      }

    } 
    // CASO 2: Es una reserva de espacio simple (Fallback logic)
    else if (this.createdSchedule && this.workspace) {
      this.isWorkspace = true;
      this.qrValue = `RESERVA-CITT-${this.createdSchedule.id || 'TEMP'}`;
    }
  }

  retrieveResponse() {
    const state = this.router.getCurrentNavigation()?.extras.state || history.state || {};
    return {
      reserva: state['reserva'] ?? null,
      workspace: state['workspace'] ?? null,
      event: state['event'] ?? null
    };
  }

  onQrUrl(url: any) {
    this.qrDownloadUrl = url;
  }

  openEditLink() {
    if (this.eventEditLink) {
      window.open(this.eventEditLink, '_blank', 'noopener');
    }
  }

  downloadQr() {
    if (this.qrDownloadUrl) {
      const a = document.createElement('a');
      a.href = this.qrDownloadUrl;
      a.download = 'codigo-qr-evento.png';
      a.click();
    }
  }

  async logout() {
    await this.storageService.clearSession();
    this.router.navigate(['/home']);
  }
}