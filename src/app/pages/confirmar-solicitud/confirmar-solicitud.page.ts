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

  // ==========================================================
  // CAMBIO 4: AÑADIR LOS COMPONENTES DEL MENÚ
  // ==========================================================
  IonMenu,
  IonMenuButton

} from '@ionic/angular/standalone';

@Component({
  selector: 'app-confirmar-solicitud',
  templateUrl: './confirmar-solicitud.page.html',
  styleUrls: ['./confirmar-solicitud.page.scss'],
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
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,

    // ==========================================================
    // CAMBIO 5: AÑADIR LOS MISMOS COMPONENTES AQUÍ
    // ==========================================================
    IonMenu,
    IonMenuButton
  ]
})
export class ConfirmarSolicitudPage {
  constructor() {}
}
