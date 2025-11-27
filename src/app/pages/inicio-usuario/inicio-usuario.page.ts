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

  private router = inject(Router);
  private menuCtrl = inject(MenuController);

  public userName = signal<string>('Rodrigo Alvarez');
  public userRole = signal<'admin' | 'docente' | 'alumno'>('admin'); 

// Banderas de permisos (Lógica acumulativa)
  canManageEvents: boolean = false; // Para Coordinador y Admin
  isAdmin: boolean = false;         // Solo para Admin

  constructor(private authService: AuthService) {
    addIcons({ 
      personCircleOutline, settingsOutline, logOutOutline, 
      documentTextOutline, calendarOutline, peopleOutline, 
      addCircleOutline, statsChartOutline, libraryOutline,
      timeOutline, cloudUploadOutline, calendarNumberOutline,
      chevronForwardOutline
    });
  }

  ngOnInit() {
    const storedName = sessionStorage.getItem('userFirstName');
    const storedLastName = sessionStorage.getItem('userLastName');

    // Nos suscribimos al rol. Si el usuario cambia (logout/login), esto se actualiza solo.
    
    if (storedName) {
      this.userName.set(`${storedName} ${storedLastName || ''}`);
    }
  }

  setPermissions(role: string) {
    // 1. El nivel base (Alumno) no necesita bandera, siempre se muestra.
    
    // 2. Nivel Intermedio: Coordinador y Admin pueden gestionar eventos
    this.canManageEvents = role === 'coordinator' || role === 'admin';

    // 3. Nivel Superior: Solo Admin ve gestión de usuarios y estadísticas
    this.isAdmin = role === 'admin';
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'menu-inicio');
  }

  cambiarRol(event: any) {
    this.userRole.set(event.detail.value);
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/home']);
  }
}