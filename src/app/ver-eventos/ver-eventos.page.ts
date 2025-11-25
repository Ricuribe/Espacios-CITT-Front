import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonMenuButton, 
  IonImg, IonMenu, IonTitle, IonList, IonItem, IonLabel, IonIcon,
  MenuController, IonChip, IonAvatar // Agregados para usuario
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, timeOutline, locationOutline, arrowForwardOutline, arrowBackOutline,
  personCircleOutline, logOutOutline, libraryOutline, folderOpenOutline, homeOutline
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
    IonChip, IonAvatar
  ]
})
export class VerEventosPage implements OnInit {
  
  private menuCtrl = inject(MenuController);
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Estado de usuario
  public isLoggedIn = signal<boolean>(false); 
  public userName = signal<string>('');

  // Datos Mock (se mantienen igual)
  eventos = [
    {
      titulo: 'Taller de Robótica',
      fecha: '15 de Octubre, 2024',
      hora: '10:00 AM - 1:00 PM',
      descripcion: 'Sumérgete en el fascinante mundo de la automatización y la mecatrónica.',
      imagen: '/assets/icon/robotica.jpg',
      categoria: 'Taller'
    },
    {
      titulo: 'Introducción a AWS',
      fecha: '22 de Octubre, 2024',
      hora: '4:00 PM - 6:00 PM',
      descripcion: 'Descubre los fundamentos de la computación en la nube con Amazon Web Services (AWS).',
      imagen: '/assets/icon/aws.jpg',
      categoria: 'Certificación'
    },
    {
      titulo: 'Charla: El Futuro de la IA',
      fecha: '5 de Noviembre, 2024',
      hora: '7:00 PM - 8:00 PM',
      descripcion: 'Únete a una conferencia inspiradora sobre las últimas tendencias de IA.',
      imagen: '/assets/icon/ai.jpg',
      categoria: 'Conferencia'
    }
  ];

  constructor() {
    addIcons({ 
      calendarOutline, timeOutline, locationOutline, arrowForwardOutline, arrowBackOutline,
      personCircleOutline, logOutOutline, libraryOutline, folderOpenOutline, homeOutline
    });
  }

  ngOnInit() {
    this.checkLogin();
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'menu-eventos');
    this.checkLogin();
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
}