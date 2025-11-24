import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FooterComponent } from 'src/app/components/footer/footer.component';

import {
  IonHeader, IonToolbar, IonImg, IonButtons, IonButton, IonContent, 
  IonGrid, IonRow, IonCol, IonIcon, IonText, IonCard, IonCardContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, 
  calendarClearOutline, 
  imagesOutline, 
  personCircleOutline, 
  lockClosedOutline,
  arrowForwardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-guia-uso',
  templateUrl: './guia-uso.page.html',
  styleUrls: ['./guia-uso.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FooterComponent,
    IonHeader, IonToolbar, IonImg, IonButtons, IonButton, IonContent, 
    IonGrid, IonRow, IonCol, IonIcon, IonText, IonCard, IonCardContent
  ]
})
export class GuiaUsoPage {
  constructor() {
    addIcons({ 
      arrowBackOutline, 
      calendarClearOutline, 
      imagesOutline, 
      personCircleOutline, 
      lockClosedOutline,
      arrowForwardOutline
    });
  }
}