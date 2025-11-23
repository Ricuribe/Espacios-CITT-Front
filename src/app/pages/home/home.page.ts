import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  IonLabel,
  MenuController // <--- Importante
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
    FooterComponent,
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
  
  private menuCtrl = inject(MenuController);

  constructor() {
    addIcons({ arrowForwardOutline });
  }

  // Se ejecuta cada vez que entras a la página
  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'menu-home');
  }
}