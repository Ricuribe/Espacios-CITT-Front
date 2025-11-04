import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from 'src/app/service/http-client';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; 

import {
  IonHeader,
  IonToolbar,
  IonImg,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonItem, // <-- Aquí está la importación (una sola vez)
  IonSelect,
  IonSpinner,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,

  // Componentes del Menú y Skeleton
  IonMenu,
  IonMenuButton,
  IonList,
  IonLabel,
  IonTitle,
  IonSkeletonText 

} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';


@Component({
  selector: 'app-seleccion-espacio',
  templateUrl: './seleccion-espacio.page.html',
  styleUrls: ['./seleccion-espacio.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink, 
    // Componentes de Ionic
    IonHeader,
    IonToolbar,
    IonImg,
    IonButtons,
    IonButton,
    IonContent,
    IonIcon,
    IonItem, // <-- Aquí está en la lista (una sola vez)
    IonSelect,
    IonSpinner,
    IonText,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,

    // Componentes del Menú y Skeleton
    IonMenu,
    IonMenuButton,
    IonList,
    IonLabel,
    IonTitle,
    IonSkeletonText
  ]
})
export class SeleccionEspacioPage implements OnInit {

  public workspaces: any[] = [];
  public isLoading = true;
  public error: any = null;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    addIcons({ arrowBackOutline });
  }

  ngOnInit() {
    this.cargarWorkspaces();
  }

  cargarWorkspaces() {
    this.isLoading = true;
    this.error = null;

    // Simular una carga más larga para ver el loader (quitar en producción)
    setTimeout(() => {
      this.apiService.getWorkspaces().subscribe({
        next: (data) => {
          this.workspaces = data;
          this.isLoading = false;
          console.log('Workspaces cargados:', this.workspaces);
        },
        error: (err) => {
          this.error = err;
          this.isLoading = false;
          console.error('Error al cargar workspaces:', err);
        }
      });
    }, 1500); // <-- 1.5 segundos de retraso simulado
  }

  verDetalleEspacio(id: number) {
    if (id) {
      this.router.navigate(['/detalle-espacio', id]);
    } else {
      console.error('ID de espacio no válido:', id);
    }
  }
}

