import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/service/http-client'; 
import { FooterComponent } from 'src/app/components/footer/footer.component';

import {
  IonHeader, IonToolbar, IonTitle, IonImg, IonButtons, IonButton, IonContent, 
  IonGrid, IonRow, IonCol, IonIcon, IonMenu, IonMenuButton, IonList, 
  IonItem, IonLabel, IonSkeletonText, IonText, MenuController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  chevronBackOutline, downloadOutline, documentTextOutline, 
  easelOutline, codeSlashOutline, personOutline, calendarOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-informacion-proyecto',
  templateUrl: './informacion-proyecto.page.html',
  styleUrls: ['./informacion-proyecto.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink, FooterComponent,
    IonHeader, IonToolbar, IonTitle, IonImg, IonButtons, IonButton, IonContent, 
    IonGrid, IonRow, IonCol, IonIcon, IonMenu, IonMenuButton, IonList, 
    IonItem, IonLabel, IonSkeletonText, IonText
  ]
})
export class InformacionProyectoPage implements OnInit {
  
  // Signals
  public memory = signal<any | null>(null);
  public isLoading = signal<boolean>(true);
  public error = signal<any>(null);

  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private menuCtrl = inject(MenuController);

  constructor() {
    addIcons({ 
      chevronBackOutline, downloadOutline, documentTextOutline, 
      easelOutline, codeSlashOutline, personOutline, calendarOutline 
    });
  }

  ngOnInit() {
    this.loadMemoryDetails();
  }

  ionViewWillEnter() {
    // Habilitamos el menú específico de esta página (reutilizamos el de proyectos o uno propio)
    this.menuCtrl.enable(true, 'menu-info-proyecto');
  }

  loadMemoryDetails() {
    this.isLoading.set(true);
    this.error.set(null);

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = +idParam;
      this.apiService.getMemoryById(id).subscribe({
        next: (data: any) => {
          // Ajuste para soportar si la API devuelve el objeto directo o envuelto
          const mem = (data && data.memory) ? data.memory : data;
          this.memory.set(mem);
          this.isLoading.set(false);
        },
        error: (err: any) => {
          this.error.set(err);
          this.isLoading.set(false);
        }
      });
    } else {
      this.isLoading.set(false);
      this.error.set({ message: 'ID de proyecto no encontrado.' });
    }
  }

  /**
   * Descarga un archivo específico. 
   * Por ahora, como tu API solo tiene un endpoint de descarga general, 
   * usaremos ese para todos los botones, pero aquí podrías diferenciar por tipo.
   */
  descargarArchivo(tipo: 'informe' | 'presentacion' | 'codigo') {
    const mem = this.memory();
    if (!mem) return;

    // Aquí podrías tener lógica diferente si tu API soporta descargar partes separadas
    // Por ejemplo: this.apiService.downloadReport(mem.id_memo)...
    
    this.apiService.downloadMemoryPdf(mem.id_memo).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Simulamos nombres diferentes según el botón presionado
        const ext = tipo === 'codigo' ? 'zip' : (tipo === 'presentacion' ? 'pptx' : 'pdf');
        a.download = `proyecto_${mem.id_memo}_${tipo}.${ext}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err: any) => console.error('Error al descargar', err)
    });
  }

  // Helper para imagen
  getImageUrl(): string {
    const mem = this.memory();
    return mem?.imagen_display || '/assets/icon/portadapagina.jpg';
  }
}