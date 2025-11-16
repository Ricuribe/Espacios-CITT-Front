import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

// Importa tu footer
// FooterComponent removed from imports: not used in this page template

// --- CAMBIO AQUÍ ---
// Añadimos los componentes del Menú
import { 
  IonHeader, 
  IonToolbar, 
  IonButtons, 
  IonImg, 
  IonButton, 
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,

  // --- AÑADIDOS PARA EL MENÚ ---
  IonMenu,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel,
  IonTitle
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-inicio-usuario',
  templateUrl: './inicio-usuario.page.html',
  styleUrls: ['./inicio-usuario.page.scss'],
  standalone: true,

  // --- Y LOS AÑADIMOS AQUÍ ---
  imports: [
    CommonModule, 
    RouterLink,
  // Componentes de Ionic que usa tu HTML
  IonHeader, 
    IonToolbar, 
    IonButtons, 
    IonImg, 
    IonButton, 
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
  // (IonCard* removed — not used in template)

    // --- AÑADIDOS PARA EL MENÚ ---
    IonMenu,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel,
    IonTitle
  ]
})
export class InicioUsuarioPage {

  public userName: string | null = sessionStorage.getItem('userFirstName');
  public userLastName: string | null = sessionStorage.getItem('userLastName');
  private router = inject(Router)
  
  constructor() {
    if (!sessionStorage.getItem('userId')){
      // this.router.navigate(['/login'])
      
    }
  }

  redirectSchedule() {
    // Redirige a selección de espacios antes de agendar eventos
    this.router.navigate(['/seleccion-espacio']);
  }

  redirectMemories() {
    // Redirige a la página de memorias/proyectos
    this.router.navigate(['/proyectos']);
  }

}

