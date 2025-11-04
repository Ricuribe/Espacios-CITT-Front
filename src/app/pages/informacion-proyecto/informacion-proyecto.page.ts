import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // <-- CAMBIO: Añadido para [routerLink]
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

@Component({
  selector: 'app-informacion-proyecto',
  templateUrl: './informacion-proyecto.page.html',
  styleUrls: ['./informacion-proyecto.page.scss'],
  standalone: true,
  
  imports: [
    CommonModule,
    RouterLink, // <-- CAMBIO: Añadido aquí
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
export class InformacionProyectoPage {
  constructor() {}
}
