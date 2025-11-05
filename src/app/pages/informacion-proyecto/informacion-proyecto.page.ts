import { Component, OnInit, signal, inject } from '@angular/core'; // <-- CAMBIO: Añadidos
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router'; // <-- CAMBIO: Añadido ActivatedRoute
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
  IonMenu,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel,

  // --- CAMBIO: AÑADIDOS PARA EL LOADER ---
  IonSkeletonText,
  IonText
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-informacion-proyecto',
  templateUrl: './informacion-proyecto.page.html',
  styleUrls: ['./informacion-proyecto.page.scss'],
  standalone: true,
  
  imports: [
    CommonModule,
    RouterLink,
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
    IonLabel,
    
    // --- CAMBIO: AÑADIDOS PARA EL LOADER ---
    IonSkeletonText,
    IonText
  ]
})
export class InformacionProyectoPage implements OnInit { // <-- CAMBIO: Añadido OnInit
  
  // --- CAMBIO: Lógica de Carga y Signals ---
  public memory = signal<Memory | null>(null);
  public isLoading = signal<boolean>(true);
  public error = signal<any>(null);

  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  constructor() {}

  ngOnInit() {
    this.loadMemoryDetails();
  }

  loadMemoryDetails() {
    this.isLoading.set(true);
    this.error.set(null);

    // 1. Lee el 'id' de la URL (gracias al ActivatedRoute)
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      const id = +idParam; // Convierte el string a número

      // 2. Llama al ApiService con ese ID
      // (Asegúrate de tener 'getMemoryById' en tu http-client.ts)
      this.apiService.getMemoryById(id).subscribe({
        next: (data) => {
          this.memory.set(data);
          this.isLoading.set(false);
          console.log('Detalle de memoria cargado:', data);
        },
        error: (err) => {
          this.error.set(err);
          this.isLoading.set(false);
          console.error('Error al cargar detalle:', err);
        }
      });
    } else {
      // No se encontró ID en la URL
      this.isLoading.set(false);
      this.error.set({ message: 'No se encontró un ID de proyecto.' });
    }
  }

  /**
   * Se llama desde el botón "Descargar proyecto"
   * Abre el PDF ('loc_disco') en una nueva pestaña.
   */
  descargarProyecto() {
    const mem = this.memory();
    // Revisa que 'mem' exista y que 'loc_disco' tenga una URL
    if (mem && mem.loc_disco) { 
      window.open(mem.loc_disco, '_blank');
    } else {
      console.error('No hay archivo PDF para descargar o la URL está vacía');
    }
  }
}