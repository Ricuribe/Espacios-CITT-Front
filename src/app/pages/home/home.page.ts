// src/app/pages/home/home.page.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import {
  // --- Módulos que ya tenías ---
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  
  // --- !! AQUÍ: AÑADE ESTOS 5 COMPONENTES DEL MENÚ !! ---
  IonMenu,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel

} from '@ionic/angular/standalone'; 
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  
  imports: [
    CommonModule,
    RouterLink, // Lo puse junto a CommonModule por orden

    // Módulos que ya tenías
    IonHeader,
    IonToolbar,
    IonTitle, // <-- Ya tenías IonTitle, pero te daba error por el menú, ahora funcionará
    IonContent,
    IonChip,
    IonImg,
    IonButtons,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    FooterComponent,
    
    // --- !! Y AQUÍ: AÑADE LOS MISMOS 5 COMPONENTES !! ---
    IonMenu,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel
  ]
})
export class HomePage {
  constructor() {}
}