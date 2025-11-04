import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/http-client';
import { Workspace } from 'src/app/interfaces/workspace';
import { ActivatedRoute, RouterLink } from '@angular/router'; // <-- CAMBIO: Añadido RouterLink
import { Location, CommonModule } from '@angular/common';

// Importaciones Standalone A La Carte
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonSpinner,
  IonImg,
  IonText,
  IonTitle,

  // ==========================================================
  // CAMBIO 7: AÑADIR LOS COMPONENTES DEL MENÚ
  // ==========================================================
  IonMenu,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel,
  IonGrid, // <-- CAMBIO: Añadidos para el layout
  IonRow,
  IonCol

} from '@ionic/angular/standalone';

// Importar icono para el botón de volver
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-detalle-espacio',
  templateUrl: './detalle-espacio.page.html',
  styleUrls: ['./detalle-espacio.page.scss'],
  standalone: true,
  imports: [
    CommonModule, // Para *ngIf
    RouterLink,   // <-- CAMBIO: Añadido aquí
    IonHeader,
    IonToolbar,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonSpinner,
    IonImg,
    IonText,
    IonTitle,

    // ==========================================================
    // CAMBIO 8: AÑADIR LOS MISMOS COMPONENTES AQUÍ
    // ==========================================================
    IonMenu,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol
  ]
})
export class DetalleEspacioPage implements OnInit {

  public workspace: Workspace | undefined; // Almacenará el workspace específico
  public isLoading = true;
  public error: any = null;

  constructor(
    private route: ActivatedRoute, // Para leer la URL
    private apiService: ApiService,
    private location: Location // Para el botón "Volver"
  ) {
    addIcons({ arrowBackOutline }); // Registra el icono
  }

  ngOnInit() {
    this.cargarDetalleWorkspace();
  }

  cargarDetalleWorkspace() {
    this.isLoading = true;
    this.error = null;

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = +idParam; 
      this.apiService.getWorkspaceById(id).subscribe({
        next: (data) => {
          this.workspace = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err;
          this.isLoading = false;
          console.error('Error al cargar detalle:', err);
        }
      });
    } else {
      this.isLoading = false;
      this.error = { message: 'No se proporcionó un ID de espacio.' };
    }
  }

  // Función para el botón "Volver"
  goBack() {
    this.location.back();
  }
}
