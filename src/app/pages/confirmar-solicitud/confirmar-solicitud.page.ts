import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Importar RouterLink si usas [routerLink]
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonImg,
  IonButtons,
  IonButton,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,

  // --- COMPONENTES DEL MENÚ ---
  IonMenu,
  IonMenuButton

} from '@ionic/angular/standalone';

// ==========================================================
// CAMBIO 1: Corregir el @Component
// ==========================================================
@Component({
  selector: 'app-confirmar-solicitud', // <-- CORREGIDO
  templateUrl: './confirmar-solicitud.page.html', // <-- CORREGIDO
  styleUrls: ['./confirmar-solicitud.page.scss'], // <-- CORREGIDO
  standalone: true,
  
  imports: [
    CommonModule,
    RouterLink, 
    IonHeader,
    IonToolbar,
    IonTitle,
    IonImg,
    IonButtons,
    IonButton,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,

    // --- COMPONENTES DEL MENÚ ---
    IonMenu,
    IonMenuButton
  ]
})
// ==========================================================
// CAMBIO 2: Corregir el nombre de la CLASE
// ==========================================================
export class ConfirmarSolicitudPage { // <-- CORREGIDO
  constructor() {}
}

