import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  // ==========================================================
  // CAMBIO 4: AÑADIR LOS COMPONENTES DEL MENÚ
  // ==========================================================
  IonMenu,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel

} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router'; // Importar RouterLink si usas [routerLink]

@Component({
  selector: 'app-confirmacion-realizada',
  templateUrl: './confirmacion-realizada.page.html',
  styleUrls: ['./confirmacion-realizada.page.scss'],
  standalone: true,
  
  imports: [
    CommonModule,
    RouterLink, // Añadir RouterLink
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
    
    // ==========================================================
    // CAMBIO 5: AÑADIR LOS MISMOS COMPONENTES AQUÍ
    // ==========================================================
    IonMenu,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel
  ]
})
export class ConfirmacionRealizadaPage {
  constructor() {}
}

