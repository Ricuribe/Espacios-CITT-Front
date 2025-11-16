import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonToggle,
  IonLabel,
  IonItem,
  IonSpinner,
  IonText,
  IonIcon,
  ModalController
} from '@ionic/angular/standalone';
import { ApiService } from 'src/app/service/http-client';
import { Workspace } from 'src/app/interfaces/workspace';
import { addIcons } from 'ionicons';
import { informationCircleOutline } from 'ionicons/icons';
import { WorkspaceDetailsComponent } from './workspace-details.component';

interface ZoneGrid {
  zone: string;
  displayName: string;
  workspace?: Workspace;
}

@Component({
  selector: 'app-seleccion-espacio',
  templateUrl: './seleccion-espacio.page.html',
  styleUrls: ['./seleccion-espacio.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonToggle,
    IonLabel,
    IonItem,
    IonSpinner,
    IonText,
    IonIcon
  ]
})
export class SeleccionEspacioPage implements OnInit {
  public workspaces: Workspace[] = [];
  public selectedWorkspaces: Set<number> = new Set();
  public isLoading = true;
  public error: any = null;
  public selectAllEnabled = false;
  
  // Grilla 2x3 para las 6 zonas
  public zoneGrid: ZoneGrid[] = [
    { zone: 'NO', displayName: 'Noroeste' },
    { zone: 'NE', displayName: 'Noreste' },
    { zone: 'CO', displayName: 'Centro Oeste' },
    { zone: 'CE', displayName: 'Centro Este' },
    { zone: 'SE', displayName: 'Sudeste' },
    { zone: 'SO', displayName: 'Sudoeste' }
  ];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private modalController: ModalController
  ) {
    addIcons({ informationCircleOutline });
  }

  ngOnInit() {
    this.loadWorkspaces();
  }

  loadWorkspaces() {
    this.isLoading = true;
    this.error = null;

    this.apiService.getWorkspaces().subscribe({
      next: (data: Workspace[]) => {
        this.workspaces = data;
        this.mapWorkspacesToGrid();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err;
        this.isLoading = false;
      }
    });
  }

  mapWorkspacesToGrid() {
    for (let zone of this.zoneGrid) {
      const workspace = this.workspaces.find(w => w.zone_space === zone.zone);
      zone.workspace = workspace;
    }
  }

  toggleWorkspace(workspaceId: number) {
    if (this.selectedWorkspaces.has(workspaceId)) {
      this.selectedWorkspaces.delete(workspaceId);
    } else {
      this.selectedWorkspaces.add(workspaceId);
    }

    // Si se deselecciona manualmente, apagar el switch
    this.updateSelectAllState();
  }

  updateSelectAllState() {
    const enabledWorkspaces = this.workspaces.filter(w => w.enabled);
    const selectedEnabled = enabledWorkspaces.filter(w => this.selectedWorkspaces.has(w.id_workspace));
    this.selectAllEnabled = selectedEnabled.length === enabledWorkspaces.length && enabledWorkspaces.length > 0;
  }

  toggleSelectAll(event: any) {
    const isChecked = event.detail.checked;
    this.selectedWorkspaces.clear();

    if (isChecked) {
      // Seleccionar todos los enabled
      const enabledWorkspaces = this.workspaces.filter(w => w.enabled);
      enabledWorkspaces.forEach(w => this.selectedWorkspaces.add(w.id_workspace));
    }
  }

  isWorkspaceSelected(workspaceId: number): boolean {
    return this.selectedWorkspaces.has(workspaceId);
  }

  isWorkspaceDisabled(workspace: Workspace | undefined): boolean {
    return !workspace || !workspace.enabled;
  }

  async showWorkspaceDetails(workspace: Workspace | undefined) {
    if (!workspace) return;

    // Request full detail from API then open modal component
    this.apiService.getWorkspaceById(workspace.id_workspace).subscribe({
      next: async (detailed: Workspace) => {
        const modal = await this.modalController.create({
          component: WorkspaceDetailsComponent,
          componentProps: { workspace: detailed }
        });

        await modal.present();
      },
      error: (err) => {
        console.error('Error fetching workspace details:', err);
      }
    });
  }

  confirmarSeleccion() {
    if (this.selectedWorkspaces.size === 0) {
      return;
    }


    const selectedIds = Array.from(this.selectedWorkspaces);
    this.router.navigate(['/evento-agendar'], {
      state: {
        allSpaces: this.selectAllEnabled,
        workspaceIds: selectedIds
      }
    });
  }

  isConfirmDisabled(): boolean {
    return this.selectedWorkspaces.size === 0;
  }
}



