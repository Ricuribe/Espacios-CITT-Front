import { Component, OnInit, signal, inject } from '@angular/core'; // <-- CAMBIO: Añadidos
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router'; // <-- CAMBIO: Añadido ActivatedRoute
import { ApiService } from 'src/app/service/http-client'; // <-- CAMBIO: Ajustado import
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonSkeletonText,
    IonText
  ]
})
export class InformacionProyectoPage implements OnInit {
  // --- CAMBIO: Lógica de Carga y Signals ---
  // Datos del proyecto (se ajusta al JSON que devuelve el backend)
  public memory = signal<any | null>(null);
  public isLoading = signal<boolean>(true);
  public error = signal<any>(null);

  // QR para "enviar al móvil"
  public qrUrl = signal<string | null>(null);
  public qrVisible = signal<boolean>(false);

  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  constructor() {}

  ngOnInit() {
    this.loadMemoryDetails();
  }

  loadMemoryDetails() {
    this.isLoading.set(true);
    this.error.set(null);

    // Lee el 'id' de la URL
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = +idParam;

      // Llama al ApiService para obtener el detalle por id
      // Se espera que getMemoryById(id) retorne el JSON indicado en la descripción
      this.apiService.getMemoryById(id).subscribe({
        next: (data) => {
          // Guardamos tal cual la respuesta; el template puede usar las claves:
          // id_memo, titulo, profesor, descripcion, imagen_display_url, fecha_inicio, fecha_termino, etc.
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
      this.isLoading.set(false);
      this.error.set({ message: 'No se encontró un ID de proyecto.' });
    }
  }

  /**
   * Solicita al backend el PDF y lo abre inmediatamente.
   * Se espera que ApiService tenga un método downloadMemoryPdf(id): Observable<Blob>
   */
  downloadMemoryPdf() {
    const mem = this.memory();
    const id = mem?.id_memo ?? this.route.snapshot.paramMap.get('id');

    if (!id) {
      console.error('No hay id disponible para descargar el PDF.');
      return;
    }

    // Llamada al servicio que debe devolver un Blob (application/pdf)
    // Asegúrate de tener implementado downloadMemoryPdf en ApiService
    this.apiService.downloadMemoryPdf(+id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        // Abrir en nueva pestaña para que el navegador muestre/descargue el PDF
        window.open(url, '_blank');
        // opcional: revocar URL después de un tiempo
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      },
      error: (err) => {
        console.error('Error al descargar PDF:', err);
      }
    });
  }

  /**
   * Genera y muestra un QR que apunta al link de descarga.
   * Usa la URL directa si el backend la entrega (ej: loc_disco o download_url),
   * de lo contrario construye una ruta de descarga esperada.
   */
  enviarAlMovil() {
    const mem = this.memory();
    const id = mem?.id_memo ?? this.route.snapshot.paramMap.get('id');

    if (!id) {
      console.error('No hay id disponible para generar QR.');
      return;
    }

    // Preferir un URL directo proporcionado por la memoria si existe
    const direct = mem?.loc_disco || mem?.download_url || null;

    // Fallback: construir una URL de descarga asumida en el backend
    // Ajusta este path si tu API tiene otra ruta real de descarga
    const fallback = `${window.location.origin}/api/memories/${id}/download`;

    const downloadLink = direct ?? fallback;

    // Usamos Google Chart API para generar un QR en tiempo real
    const size = 300;
    const qr = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(downloadLink)}`;

    this.qrUrl.set(qr);
    this.qrVisible.set(true);
  }

  // Wrapper usado por la plantilla para evitar el error TS2339
  descargarProyecto() {
    this.downloadMemoryPdf();
  }
}