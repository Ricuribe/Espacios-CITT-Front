import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,     // <- Para la barra morada
  IonImg,
  IonButtons,
  IonButton,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon       // <- Para el botón 'Volver' y el footer
} from '@ionic/angular/standalone'; // Asegúrate que la importación sea de '@ionic/angular/standalone'

@Component({
  selector: 'app-guia-uso',
  templateUrl: './guia-uso.page.html',
  styleUrls: ['./guia-uso.page.scss'],
  standalone: true,
  
  // ¡Aquí importamos todos los componentes!
  imports: [
    CommonModule,
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
    IonIcon
  ]
})
export class GuiaUsoPage {
  constructor() {}
}