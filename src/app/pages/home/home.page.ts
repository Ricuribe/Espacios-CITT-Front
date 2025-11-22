import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
// Asegúrate de que la ruta sea correcta según tu estructura de carpetas
import { FooterComponent } from 'src/app/components/footer/footer.component'; 

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonChip,
  IonImg,
  IonButtons,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonMenu,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FooterComponent, // <--- CRUCIAL para que funcione <app-footer>
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonChip,
    IonImg,
    IonButtons,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonMenu,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel
  ]
})
export class HomePage {
  constructor() {
    // Registramos el icono de la flechita
    addIcons({ arrowForwardOutline });
  }
}