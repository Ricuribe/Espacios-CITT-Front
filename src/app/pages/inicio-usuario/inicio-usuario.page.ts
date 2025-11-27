import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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

  // Variables para controlar QUÉ se muestra
  isStudent: boolean = false;       // Alumno
  canManageEvents: boolean = false; // Coordinador o Administrativo
  isAdmin: boolean = false;         // Solo Administrativo
  
  // Nombre de usuario para el saludo
  userName = signal<string>('Usuario');

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
    // 1. Suscripción al ROL real desde AuthService
    this.authService.currentRole$.subscribe(role => {
      this.setPermissions(role || '');
    });

    // 2. Suscripción al NOMBRE del usuario
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName.set(`${user.first_name} ${user.last_name}`);
      }
    });
  }

  setPermissions(role: string) {
    // Lógica estricta basada en tus roles ('alumno', 'coordinador', 'administrativo')
    
    this.isStudent = role === 'alumno';
    
    // Coordinadores y Administrativos pueden gestionar eventos
    this.canManageEvents = role === 'coordinador' || role === 'administrativo';
    
    // Solo Administrativos ven la gestión de usuarios y estadísticas
    this.isAdmin = role === 'administrativo';
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'menu-inicio');
  }

  async logout() {
    await this.authService.logout();
  }
}