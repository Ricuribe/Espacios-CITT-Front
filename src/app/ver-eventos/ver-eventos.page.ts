import { Component, OnInit, inject } from '@angular/core'; // Importamos inject
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonButtons, 
  IonButton, 
  IonMenuButton, 
  IonImg, 
  IonMenu,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  MenuController // <--- IMPORTANTE: Importamos el controlador de menú
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, 
  timeOutline, 
  locationOutline, 
  arrowForwardOutline,
  arrowBackOutline
} from 'ionicons/icons';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-ver-eventos',
  templateUrl: './ver-eventos.page.html',
  styleUrls: ['./ver-eventos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FooterComponent,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonMenuButton,
    IonImg,
    IonMenu,
    IonTitle,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonCard
  ]
})
export class VerEventosPage implements OnInit {

  // Inyectamos el MenuController
  private menuCtrl = inject(MenuController);

  eventos = [
    {
      titulo: 'Taller de Robótica',
      fecha: '15 de Octubre, 2024',
      hora: '10:00 AM - 1:00 PM',
      descripcion: 'Sumérgete en el fascinante mundo de la automatización y la mecatrónica. En este taller práctico, tendrás la oportunidad de construir y programar tu primer robot desde cero.',
      imagen: '/assets/icon/robotica.jpg',
      categoria: 'Taller'
    },
    {
      titulo: 'Introducción a AWS',
      fecha: '22 de Octubre, 2024',
      hora: '4:00 PM - 6:00 PM',
      descripcion: 'Descubre los fundamentos de la computación en la nube con Amazon Web Services (AWS). Este taller te guiará a través de los servicios principales y cómo desplegar tu primera aplicación.',
      imagen: '/assets/icon/aws.jpg',
      categoria: 'Certificación'
    },
    {
      titulo: 'Charla: El Futuro de la IA',
      fecha: '5 de Noviembre, 2024',
      hora: '7:00 PM - 8:00 PM',
      descripcion: 'Únete a una conferencia inspiradora sobre las últimas tendencias y el profundo impacto que la Inteligencia Artificial está teniendo en nuestra sociedad.',
      imagen: '/assets/icon/ai.jpg',
      categoria: 'Conferencia'
    }
  ];

  constructor() {
    addIcons({ calendarOutline, timeOutline, locationOutline, arrowForwardOutline, arrowBackOutline });
  }

  ngOnInit() { }

  // --- LÓGICA PARA ACTIVAR EL MENÚ CORRECTO ---
  
  // Se ejecuta cada vez que la vista va a entrar (antes de mostrarse)
  ionViewWillEnter() {
    // Habilitamos el menú específico de esta página ('menu-eventos')
    this.menuCtrl.enable(true, 'menu-eventos');
  }

  // (Opcional) Se ejecuta al salir
  ionViewWillLeave() {
    // Podríamos deshabilitarlo si quisiéramos ser muy estrictos, 
    // pero usualmente habilitar el siguiente en la otra página es suficiente.
  }
}