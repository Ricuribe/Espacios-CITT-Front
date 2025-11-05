import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/http-client';
import { Workspace } from 'src/app/interfaces/workspace';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
    CommonModule, 
    RouterLink,   
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

  public workspace: Workspace | undefined;
  public isLoading = true;
  public error: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private location: Location 
  ) {
    addIcons({ arrowBackOutline });
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

  ScheduleReservation() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      console.warn('No se proporcionó un ID de espacio.');
      return;
    }
    console.log('le id', idParam)
    const id = +idParam;

    sessionStorage.setItem('workspaceId', id.toString());
    this.router.navigate(['agendar-hora']);
    
  }

  goBack() {
    this.location.back();
  }
}
