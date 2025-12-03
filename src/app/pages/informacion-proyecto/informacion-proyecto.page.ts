import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/service/http-client'; 
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { AuthService } from 'src/app/service/auth.service';

// IMPORTAMOS LAS FUNCIONES EXISTENTES (Usamos alias para evitar conflicto de nombres)
import { 
  getSchoolName as resolveSchoolName, 
  getCareerName as resolveCareerName 
} from 'src/app/constants/schools-data'; 

import {
  IonHeader, IonToolbar, IonTitle, IonImg, IonButtons, IonButton, IonContent, 
  IonGrid, IonRow, IonCol, IonIcon, IonMenu, IonMenuButton, IonList, 
  IonItem, IonLabel, IonSkeletonText, IonText, MenuController, IonChip, IonAvatar,
  IonCard, IonCardContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  chevronBackOutline, downloadOutline, documentTextOutline, 
  easelOutline, codeSlashOutline, personOutline, calendarOutline,
  homeOutline, folderOpenOutline, libraryOutline, logOutOutline,
  schoolOutline, businessOutline, bookOutline, logoLinkedin, timeOutline,
  personCircleOutline, createOutline, briefcaseOutline
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
    IonItem, IonLabel, IonSkeletonText, IonText, IonChip, IonAvatar,
    IonCard, IonCardContent
  ]
})
export class InformacionProyectoPage implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private menuCtrl = inject(MenuController);
  private authService = inject(AuthService);

  public memory = signal<any>(null);
  public creators = signal<any[]>([]);
  public isLoading = signal<boolean>(true);
  public error = signal<any>(null);
  public isAdmin = signal<boolean>(false);

  constructor() {
    addIcons({ 
      chevronBackOutline, downloadOutline, documentTextOutline, 
      easelOutline, codeSlashOutline, personOutline, calendarOutline,
      homeOutline, folderOpenOutline, libraryOutline, logOutOutline,
      schoolOutline, businessOutline, bookOutline, logoLinkedin, timeOutline,
      personCircleOutline, createOutline, briefcaseOutline
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMemoryData(Number(id));
    }
    this.checkPermissions();
  }

  checkPermissions() {
    this.authService.currentRole$.subscribe(role => {
      this.isAdmin.set(role === 'administrativo');
    });
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'menu-info-proyecto');
  }

  loadMemoryData(id: number) {
    this.isLoading.set(true);
    
    this.apiService.getMemoryById(id).subscribe({
      next: (data: any) => {
        console.log('Datos recibidos:', data);
        
        // Manejamos la estructura { memory: {...}, details: {...} }
        const memData = data.memory ? data.memory : data;
        this.memory.set(memData);

        if (data.details && data.details.detalles) {
          this.creators.set(data.details.detalles);
        }

        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Error cargando proyecto', err);
        this.error.set(err);
        this.isLoading.set(false);
      }
    });
  }

  // --- Helpers de Traducción (USANDO LAS FUNCIONES IMPORTADAS) ---
  
  getSchoolName(code: string): string {
    // Usamos la función importada de schools-data.ts
    return resolveSchoolName(code);
  }

  getCareerName(code: string): string {
    // Usamos la función importada de schools-data.ts
    return resolveCareerName(code);
  }

  openLinkedin(url: string) {
    if (url) {
      window.open(url, '_blank', 'noopener');
    }
  }

  // --- Funciones existentes ---

  async irAEditarMemoria() {
    const mem = this.memory();
    if(mem) {
      this.router.navigate(['/editar-memoria', mem.id_memo]);
    }
  }

  descargarArchivo(tipo: 'informe' | 'presentacion' | 'codigo') {
    const mem = this.memory();
    if (!mem) return;
    
    this.apiService.downloadMemoryPdf(mem.id_memo).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = tipo === 'codigo' ? 'zip' : (tipo === 'presentacion' ? 'pptx' : 'pdf');
        a.download = `proyecto_${mem.id_memo}_${tipo}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Error descarga', err)
    });
  }

  getImageUrl() {
    const mem = this.memory();
    return mem?.imagen_display_url || mem?.imagen_display || 'assets/icon/portadapagina.jpg';
  }
}