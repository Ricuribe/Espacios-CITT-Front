import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, peopleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tipo-agendar',
  templateUrl: './tipo-agendar.page.html',
  styleUrls: ['./tipo-agendar.page.scss'],
  standalone: true,
  imports: [IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    CommonModule,
    FormsModule]
})
export class TipoAgendarPage{
constructor(private router: Router) {
    addIcons({ calendarOutline, peopleOutline });
  }

  // Navega a la lista de espacios de trabajo
  goToWorkspaces() {
    this.router.navigate(['/seleccion-espacio']);
  }

  // Navega directamente al calendario para eventos
  goToEventBooking() {
    this.router.navigate(['/evento-agendar'], {
      queryParams: { type: 'event' },
    });
  }
}
