import { Component, OnInit } from '@angular/core';
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
  IonMenu,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel

} from '@ionic/angular/standalone';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // Importar RouterLink si usas [routerLink]

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
    IonMenu,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel
  ]
})
export class ConfirmacionRealizadaPage implements OnInit {
  
  private createdSchedule : any = null;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.createdSchedule = this.retrieveResponse();
    console.log('La reserva creada: ', this.createdSchedule)
  }

  retrieveResponse() {
    const response = this.router.getCurrentNavigation()?.extras.state?.['reserva'];
    return response;
  }

}

