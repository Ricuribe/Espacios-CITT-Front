import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { AuthService } from 'src/app/service/auth.service';

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
export class GuiaUsoPage implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);

  public isLoggedIn = signal<boolean>(false);
  
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
  ngOnInit() {
    // Nos suscribimos al estado de autenticación
    this.authService.isAuthenticated$.subscribe(auth => {
      this.isLoggedIn.set(auth);
    });
  }

  // Función inteligente para el botón de volver
  goBack() {
    if (this.isLoggedIn()) {
      this.router.navigate(['/inicio-usuario']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}