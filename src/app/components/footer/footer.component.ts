import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Importa los componentes de Ionic que usaremos en el HTML
import { 
  IonFooter, 
  IonToolbar, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonImg, 
  IonIcon, 
  IonButton 
} from '@ionic/angular/standalone';

// Importa los íconos que usaremos
import { addIcons } from 'ionicons';
import { logoInstagram, logoLinkedin, globeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-footer', // Este es el tag HTML que usaremos: <app-footer>
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    
    // Añade los componentes de Ionic aquí
    IonFooter, 
    IonToolbar, 
    IonGrid, 
    IonRow, 
    IonCol, 
    IonImg, 
    IonIcon, 
    IonButton
  ]
})
export class FooterComponent {
  constructor() {
    // Registra los íconos para que se muestren
    addIcons({ logoInstagram, logoLinkedin, globeOutline });
  }
}