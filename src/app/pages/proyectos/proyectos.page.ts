import { Component, OnInit, signal, inject } from '@angular/core'; // <-- CAMBIO: Añadidos
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // <-- CAMBIO: Añadidos
import { ApiService, Memory } from 'src/app/service/http-client'; // <-- CAMBIO: Añadido

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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonLabel,

  // --- CAMBIO: AÑADIDOS PARA EL MENÚ Y LOADER ---
  IonMenu,
  IonMenuButton,
  IonList,
  IonItem,
  IonSkeletonText, // <-- Para el loader
  IonText // <-- Para el error
  
} from '@ionic/angular/standalone'; 

@Component({
  selector: 'app-proyectos',
  templateUrl: './proyectos.page.html',
  styleUrls: ['./proyectos.page.scss'],
  standalone: true,
  
  imports: [
    CommonModule,
    RouterLink, // <-- CAMBIO: Añadido
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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonLabel,

    // --- CAMBIO: AÑADIDOS PARA EL MENÚ Y LOADER ---
    IonMenu,
    IonMenuButton,
    IonList,
    IonItem,
    IonSkeletonText,
    IonText
  ]
})
export class ProyectosPage implements OnInit { // <-- CAMBIO: Añadido OnInit
  
  // --- CAMBIO: Lógica de Carga y Signals ---
  public memories = signal<Memory[]>([]);
  public isLoading = signal<boolean>(true);
  public error = signal<any>(null);

  private apiService = inject(ApiService);
  private router = inject(Router);

  constructor() {}

  ngOnInit() {
    this.loadMemories();
  }

  loadMemories() {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiService.getMemories().subscribe({
      next: (data) => {
        this.memories.set(data);
        this.isLoading.set(false);
        console.log('Memorias cargadas:', data);
      },
      error: (err) => {
        this.error.set(err);
        this.isLoading.set(false);
        console.error('Error al cargar memorias:', err);
      }
    });
  }

  /** Navega a la página de detalle del proyecto */
  verDetalle(id: number) {
    // Asume que tu página de detalle se llama 'informacion-proyecto'
    // y recibe un 'id'
    this.router.navigate(['/informacion-proyecto', id]);
  }
}