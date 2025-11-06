import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBackButton,
  IonButtons,
  IonChip,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/service/http-client';
import { addIcons } from 'ionicons';
import { peopleOutline } from 'ionicons/icons';

// Inferencia de la interfaz basada en tu código React
export interface Workspace {
  id_workspace: number;
  name: string;
  space_type: string;
  description: string;
  max_occupancy: number;
  image: string;
  resources: any[];
}
/*
    "id_workspace": 1,
    "name": "Espacio de reuniones",
    "space_type": "Reuniones",
    "description": "Espacio de reuniones de prueba\r\nUbicado en una esquina con tele",
    "max_occupancy": 4,
    "image": "http://127.0.0.1:8000/media/workspace_images/workspace_1.jpg",
    "resources": [
*/

@Component({
  selector: 'app-otro-agendar-espacio',
  templateUrl: './otro-agendar-espacio.page.html',
  styleUrls: ['./otro-agendar-espacio.page.scss'],
  standalone: true,
  imports: [CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBackButton,
    IonButtons,
    IonChip,
    IonIcon,
    IonSpinner,
    CommonModule]
})
export class OtroAgendarEspacioPage implements OnInit {
// Usamos un observable para manejar el estado de carga
  public workspaces$!: Observable<Workspace[]>;

  constructor(private apiService: ApiService, private router: Router) {
    addIcons({ peopleOutline });
  }

  ngOnInit() {
    // Aquí es donde llamas a tu servicio.
    // Asumo que tienes un método 'getWorkspaces()'
    this.workspaces$ = this.apiService.getWorkspaces(); 
  }

  selectWorkspace(workspace: Workspace) {
    // Navegamos a la siguiente página pasando el ID del espacio
    this.router.navigate(['/booking-datetime', workspace.id_workspace]);
  }
}
