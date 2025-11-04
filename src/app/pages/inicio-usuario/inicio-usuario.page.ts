import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Importa tu footer
import { FooterComponent } from 'src/app/components/footer/footer.component';

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
    FooterComponent,

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
  ]
})
export class InicioUsuarioPage {

  constructor() { }

}

