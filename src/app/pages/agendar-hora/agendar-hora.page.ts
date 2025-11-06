import { Component, signal, computed, OnInit } from '@angular/core'; // <-- CAMBIO 1: Añadí OnInit
import { CommonModule } from '@angular/common';
// ==========================================================
// CAMBIO 2: Importar ActivatedRoute
// ==========================================================
import { Router, RouterLink, ActivatedRoute } from '@angular/router'; 
import {
  IonHeader,
  IonToolbar,
  IonImg,
  IonButtons,
  IonButton,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonDatetime,
  IonRange,
  IonLabel,
  IonMenu,
  IonMenuButton,
  IonList,
  IonItem,
  IonTitle
} from '@ionic/angular/standalone';
import { IonSkeletonText } from '@ionic/angular/standalone';
import { SlotService } from 'src/app/service/slot.service';

@Component({
  selector: 'app-agendar-hora',
  templateUrl: './agendar-hora.page.html',
  styleUrls: ['./agendar-hora.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink, IonHeader, IonToolbar, IonImg, IonButtons, 
    IonButton, IonContent, IonGrid, IonRow, IonCol, IonIcon, IonDatetime, 
    IonRange, IonLabel, IonMenu, IonMenuButton, IonList, IonItem, IonTitle 
    , IonSkeletonText
  ]
})
export class AgendarHoraPage implements OnInit {

  // --- Propiedades y Signals ---
  public today: Date;
  public todayISO: string;
  public maxDateISO: string;
  public selectedDate = signal<string>('');
  public selectedDuration = signal<number>(30);
  public selectedSlot = signal<string | null>(null);

  public workspaceId: number | null = null;
  public slots = signal<string[]>([]);
  public loadingSlots = signal<boolean>(false);


  


  constructor(
    private router: Router,
    private route: ActivatedRoute
    , private slotService: SlotService
  ) { 

    this.today = new Date();
    const year = this.today.getFullYear();
    const month = (this.today.getMonth() + 1).toString().padStart(2, '0');
    const day = this.today.getDate().toString().padStart(2, '0');
    this.todayISO = `${year}-${month}-${day}`;
    const maxDate = new Date(this.today);
    maxDate.setMonth(this.today.getMonth() + 3);
    const maxYear = maxDate.getFullYear();
    const maxMonth = (maxDate.getMonth() + 1).toString().padStart(2, '0');
    const maxDay = maxDate.getDate().toString().padStart(2, '0');
    this.maxDateISO = `${maxYear}-${maxMonth}-${maxDay}`;
    this.selectedDate.set(this.todayISO);
  }

  ngOnInit() {
    
    this.workspaceId = sessionStorage.getItem('workspaceId') ? +sessionStorage.getItem('workspaceId')! : null;

    if (this.workspaceId != null) {
      
      console.log('ID del espacio a reservar:', this.workspaceId);
      // Cargar actividades del workspace y actualizar slots
      this.updateSlots(true);
    } else {
      console.error('¡Error! No se recibió el ID del espacio.');
      //this.router.navigate(['/']);
    }
  }

  // --- (Tus otras funciones se quedan igual) ---
  handleDateChange(event: any) {
    const newDate = event.detail.value.split('T')[0];
    this.selectedDate.set(newDate);
    this.selectedSlot.set(null);
    this.updateSlots(true);
  }
  handleDurationChange(event: any) {
    const newDuration = event.detail.value;
    this.selectedDuration.set(newDuration);
    this.selectedSlot.set(null);
    // No refetch needed when only duration changes; use cache
    this.updateSlots(false);
  }
  selectSlot(slot: string) {
    this.selectedSlot.set(slot);
    console.log(`Fecha: ${this.selectedDate()}, Duración: ${this.selectedDuration()} min, Hora: ${this.selectedSlot()}`);
  }

  
  /** Se llama al hacer clic en el botón final */
  async confirmarReserva() {
    if (!this.selectedSlot() || !this.workspaceId) {
      console.error("Debe seleccionar una hora y debe existir un ID de espacio");
      return;
    }

    // Antes de confirmar, revalida availability para evitar doble-agendamiento
    this.loadingSlots.set(true);
    try {
      const refreshed = await this.slotService.getAvailableSlots(this.selectedDate(), this.selectedDuration(), this.workspaceId, true);
      if (!refreshed.includes(this.selectedSlot()!)) {
        console.error('La hora seleccionada ya no está disponible. Por favor elija otra hora.');
        this.slots.set(refreshed);
        return;
      }

      // 1. Prepara los datos para enviar
      const datosReserva = {
        workspaceId: this.workspaceId,
        fecha: this.selectedDate(),
        duracion: this.selectedDuration(),
        hora: this.selectedSlot()
      };
      console.log("¡Reserva Confirmada!", datosReserva);

      this.router.navigate(['/confirmar-solicitud'], {
        state: {
          reserva: datosReserva
        }
      });
    } catch (e) {
      console.error('Error validando disponibilidad antes de confirmar:', e);
    } finally {
      this.loadingSlots.set(false);
    }
  }

  private async updateSlots(forceRefresh = true) {
    if (!this.selectedDate() || this.workspaceId == null) return;
    // forceRefresh indicates whether to re-fetch activities from backend
    this.loadingSlots.set(true);
    this.selectedSlot.set(null);
    try {
      const available = await this.slotService.getAvailableSlots(this.selectedDate(), this.selectedDuration(), this.workspaceId, forceRefresh);
      this.slots.set(available);
    } catch (e) {
      console.error('Error al obtener slots:', e);
      this.slots.set([]);
    } finally {
      this.loadingSlots.set(false);
    }
  }
}

