import { Component, OnInit } from '@angular/core'; // <-- CAMBIO: Añadido OnInit
import { CommonModule } from '@angular/common';
import { ApiService } from 'src/app/service/http-client';
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
  selector: 'app-mis-solicitudes',
  templateUrl: './mis-solicitudes.page.html',
  styleUrls: ['./mis-solicitudes.page.scss'],
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
export class MisSolicitudesPage implements OnInit { // <-- CAMBIO: Añadido implements OnInit
  workspaces: any[] = [];
  schedules: any[] = [];
  error: any;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.getWorkspacesData();
    this.getSchedulesData();
  }

  getWorkspacesData() {
    this.apiService.getWorkspaces().subscribe({
      next: (data) => {
        this.workspaces = data;
        console.log('Workspaces:', this.workspaces);
      },
      error: (err) => {
        this.error = err;
        console.error('Error fetching workspaces:', err);
      }
    });
  }

  getSchedulesData() {
    this.apiService.getSchedules().subscribe({
      next: (data) => {
        this.schedules = data;
        console.log('Schedules:', this.schedules);
      },
      error: (err) => {
        this.error = err;
        console.error('Error fetching schedules:', err);
      }
    });
  }
}
