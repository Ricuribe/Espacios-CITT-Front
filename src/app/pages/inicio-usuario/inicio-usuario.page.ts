import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from 'src/app/components/footer/footer.component';

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
  timeOutline, cloudUploadOutline, calendarNumberOutline
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

  // Estado del Usuario
  public userName = signal<string>('Rodrigo Alvarez');
  
  // Rol inicial (Cámbialo aquí o usa el selector en pantalla para probar)
  public userRole = signal<'admin' | 'docente' | 'alumno'>('alumno'); 

  constructor() {
    addIcons({ 
      personCircleOutline, settingsOutline, logOutOutline, 
      documentTextOutline, calendarOutline, peopleOutline, 
      addCircleOutline, statsChartOutline, libraryOutline,
      timeOutline, cloudUploadOutline, calendarNumberOutline
    });
  }

  ngOnInit() {
    // Intenta recuperar datos de sesión si existen
    const storedName = sessionStorage.getItem('userFirstName');
    const storedLastName = sessionStorage.getItem('userLastName');
    
    if (storedName) {
      this.userName.set(`${storedName} ${storedLastName || ''}`);
    }
  }

  ionViewWillEnter() {
    // Activa el menú específico de esta página
    this.menuCtrl.enable(true, 'menu-inicio');
  }

  // Método para cambiar de rol desde el selector (Solo pruebas)
  cambiarRol(event: any) {
    this.userRole.set(event.detail.value);
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/home']);
  }
}