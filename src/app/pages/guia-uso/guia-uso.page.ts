import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // <-- Para el botón [routerLink]
import {
  IonHeader,
  IonToolbar,
  IonImg,
  IonButtons,
  IonButton,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon
  // (Ya no necesitamos IonMenu, IonMenuButton, etc.)
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons'; // <-- Para el icono
import { arrowBackOutline } from 'ionicons/icons'; // <-- El icono de volver

@Component({
  selector: 'app-guia-uso',
  templateUrl: './guia-uso.page.html',
  styleUrls: ['./guia-uso.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink, // <-- Añadido
    IonHeader,
    IonToolbar,
    IonImg,
    IonButtons,
    IonButton,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon
  ]
})
export class GuiaUsoPage {
  constructor() {
    // Registra el icono de la flecha de volver
    addIcons({ arrowBackOutline });
  }
}