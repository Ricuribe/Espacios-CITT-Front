import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { AuthService } from 'src/app/service/auth.service';

import {
  IonHeader, IonToolbar, IonButtons, IonButton, IonMenuButton, IonImg, 
  IonMenu, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
  IonCardTitle, IonCardSubtitle, IonCardContent, IonIcon, IonText, 
  IonAvatar, IonLabel, IonList, IonItem, MenuController, IonChip, 
  IonSegment, IonSegmentButton, IonTitle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personCircleOutline, settingsOutline, logOutOutline, 
  documentTextOutline, calendarOutline, peopleOutline, 
  addCircleOutline, statsChartOutline, libraryOutline,
  timeOutline, cloudUploadOutline, calendarNumberOutline,
  chevronForwardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-inicio-usuario',
  templateUrl: './inicio-usuario.page.html',
  styleUrls: ['./inicio-usuario.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink, FooterComponent,
    IonHeader, IonToolbar, IonButtons, IonButton, IonMenuButton, IonImg, 
    IonMenu, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
    IonCardTitle, IonCardSubtitle, IonCardContent, IonIcon, IonText, 
    IonAvatar, IonLabel, IonList, IonItem, IonChip, 
    IonSegment, IonSegmentButton, IonTitle
  ]
})
export class InicioUsuarioPage implements OnInit {

  // Variables de control de vista
  isStudent: boolean = false;       
  canManageEvents: boolean = false; // Profesores y Admins
  isAdmin: boolean = false;         // SOLO Admins
  
  // Nombre de usuario (Signal)
  userName = signal<string>('Usuario');

  // Inyecciones
  private router = inject(Router); // Necesario para redirecciones manuales

  constructor(
    private authService: AuthService,
    private menuCtrl: MenuController
  ) {
    addIcons({ 
      personCircleOutline, settingsOutline, logOutOutline, 
      documentTextOutline, calendarOutline, peopleOutline, 
      addCircleOutline, statsChartOutline, libraryOutline,
      timeOutline, cloudUploadOutline, calendarNumberOutline,
      chevronForwardOutline
    });
  }

  ngOnInit() {
    // 1. Suscripción al ROL
    this.authService.currentRole$.subscribe(role => {
      this.setPermissions(role || '');
    });

    // 2. Suscripción al NOMBRE
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName.set(`${user.first_name} ${user.last_name}`);
      } else {
        // Fallback si no hay user en el servicio (ej. recarga de página)
        const localFirst = sessionStorage.getItem('userFirstName');
        const localLast = sessionStorage.getItem('userLastName');
        if (localFirst) this.userName.set(`${localFirst} ${localLast || ''}`);
      }
    });
  }

  setPermissions(role: string) {
    const r = role.toLowerCase();
    
    this.isStudent = r === 'alumno';
    
    // Profesores (Coordinadores) y Admins pueden gestionar eventos
    this.canManageEvents = r === 'coordinador' || r === 'docente' || r === 'administrativo' || r === 'admin';
    
    // SOLO Administrativos (Admins) pueden subir memorias
    this.isAdmin = r === 'administrativo' || r === 'admin';
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'menu-inicio');
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/home']);
  }
}