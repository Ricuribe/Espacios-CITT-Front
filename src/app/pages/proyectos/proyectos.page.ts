import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterLink } from '@angular/router';

import { ApiService, Memory } from 'src/app/service/http-client'; 
import { FooterComponent } from 'src/app/components/footer/footer.component';

import {
  IonHeader, IonToolbar, IonTitle, IonImg, IonButtons, IonButton, IonContent, 
  IonGrid, IonRow, IonCol, IonIcon, 
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, 
  IonLabel, IonMenu, IonMenuButton, IonList, 
  IonItem, IonSkeletonText, IonText, 
  IonSearchbar, 
  IonChip,      
  MenuController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  eyeOutline, downloadOutline, searchOutline, filterOutline, 
  arrowForwardOutline, chevronDownOutline, chevronBackOutline,
  // Nuevos iconos para el menú
  homeOutline, folderOpenOutline, libraryOutline, logOutOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-proyectos',
  templateUrl: './proyectos.page.html',
  styleUrls: ['./proyectos.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, 
    FooterComponent, 
    IonHeader, IonToolbar, IonTitle, IonImg, IonButtons, IonButton, IonContent, 
    IonGrid, IonRow, IonCol, IonIcon, 
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, 
    IonLabel, IonMenu, IonMenuButton, IonList, 
    IonItem, IonSkeletonText, IonText, 
    IonSearchbar, 
    IonChip       
  ]
})
export class ProyectosPage implements OnInit {
  
  private apiService = inject(ApiService);
  private router = inject(Router);
  private menuCtrl = inject(MenuController);

  public memories = signal<Memory[]>([]);
  public filteredMemories = signal<Memory[]>([]); 
  public isLoading = signal<boolean>(true);
  public error = signal<any>(null);
  
  public searchTerm = signal<string>('');
  public selectedYear = signal<number | null>(null);
  public filterYears = [2024, 2023, 2022, 2021, 2020];

  constructor() {
    addIcons({ 
      eyeOutline, downloadOutline, searchOutline, filterOutline, 
      arrowForwardOutline, chevronDownOutline, chevronBackOutline,
      // Iconos del menú
      homeOutline, folderOpenOutline, libraryOutline, logOutOutline
    });
  }

  ngOnInit() {
    this.loadMemories();
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'menu-proyectos');
  }

  loadMemories() {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiService.getMemories().subscribe({
      next: (data: Memory[]) => {
        this.memories.set(data);
        this.applyFilters(); 
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.error.set(err);
        this.isLoading.set(false);
        console.error('Error al cargar memorias:', err);
      }
    });
  }

  applyFilters() {
    let result = this.memories();
    const term = this.searchTerm().toLowerCase();
    if (term) {
      result = result.filter((m: Memory) => 
        (m.titulo && m.titulo.toLowerCase().includes(term)) ||
        (m.profesor && m.profesor.toLowerCase().includes(term)) ||
        (m.descripcion && m.descripcion.toLowerCase().includes(term))
      );
    }
    if (this.selectedYear()) {
      const yearStr = String(this.selectedYear());
      result = result.filter((m: Memory) => m.fecha_inicio && m.fecha_inicio.startsWith(yearStr));
    }
    this.filteredMemories.set(result);
  }

  onSearchChange(event: any) {
    this.searchTerm.set(event.detail.value);
    this.applyFilters();
  }

  filtrarPorAnio(anio: number) {
    if (this.selectedYear() === anio) {
      this.selectedYear.set(null);
    } else {
      this.selectedYear.set(anio);
    }
    this.applyFilters();
  }

  verDetalle(id: number) {
    if (!id) return;
    this.router.navigate(['/informacion-proyecto', id]);
  }

  descargarPDF(id: number, event: Event) {
    event.stopPropagation();
    this.apiService.downloadMemoryPdf(id).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `memoria_${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err: any) => console.error('Error descarga', err)
    });
  }
}