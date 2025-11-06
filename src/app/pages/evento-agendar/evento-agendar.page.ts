import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Importante para el ion-toggle
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonDatetime, IonItem, IonLabel, IonRange, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonList, IonMenu, IonImg, IonMenuButton, IonSkeletonText } from '@ionic/angular/standalone';
import { ApiService } from 'src/app/service/http-client';
import { SlotService } from 'src/app/service/slot.service';
import { Workspace } from '../otro-agendar-espacio/otro-agendar-espacio.page'; // Reutilizamos la interfaz
import { addIcons } from 'ionicons';
import { checkmarkCircle } from 'ionicons/icons';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-evento-agendar',
  templateUrl: './evento-agendar.page.html',
  styleUrls: ['./evento-agendar.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // <-- Necesario para [(ngModel)]
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonDatetime,
    IonItem,
    IonLabel,
    IonRange,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonRange,
    RouterLink,
    IonList,
    IonMenu,
    IonImg,
    IonMenuButton,
    IonSkeletonText
  ]

})
export class EventoAgendarPage implements OnInit {

 // --- Propiedades y Signals ---
  public today: Date;
  public todayISO: string;
  public maxDateISO: string;
  public selectedDate = signal<string>('');
  public selectedDuration = signal<number>(30);
  public selectedSlot = signal<string | null>(null);
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
    // Al entrar, cargamos actividades y calculamos slots para la fecha seleccionada (force refresh)
    this.updateSlots(true);
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
    // No need to re-fetch backend on duration change; just recalc from cached activities
    this.updateSlots(false);
  }
  selectSlot(slot: string) {
    this.selectedSlot.set(slot);
    console.log(`Fecha: ${this.selectedDate()}, Duración: ${this.selectedDuration()} min, Hora: ${this.selectedSlot()}`);
  }

  /**
   * updateSlots(forceRefresh=true when called after date change to re-fetch latest bookings).
   */
  private async updateSlots(forceRefresh = true) {
    if (!this.selectedDate()) return;
    this.loadingSlots.set(true);
    this.selectedSlot.set(null); // prevent selecting while loading
    try {
      const available = await this.slotService.getAvailableSlots(this.selectedDate(), this.selectedDuration(), undefined, forceRefresh);
      this.slots.set(available);
    } catch (e) {
      console.error('Error al obtener slots:', e);
      this.slots.set([]);
    } finally {
      this.loadingSlots.set(false);
    }
  }

  
  /** Se llama al hacer clic en el botón final */
  async confirmarReserva() {
    if (!this.selectedSlot()) {
      console.error("Debe seleccionar una hora");
      return;
    }

    // Antes de confirmar, revalida availability (re-fetch) para evitar doble-agendamiento
    this.loadingSlots.set(true);
    try {
      const refreshed = await this.slotService.getAvailableSlots(this.selectedDate(), this.selectedDuration(), undefined, true);
      if (!refreshed.includes(this.selectedSlot()!)) {
        console.error('La hora seleccionada ya no está disponible. Por favor elija otra hora.');
        // Actualiza la lista visible
        this.slots.set(refreshed);
        return;
      }

      // 1. Prepara los datos para enviar
      const datosReserva = {
        fecha: this.selectedDate(),
        duracion: this.selectedDuration(),
        hora: this.selectedSlot()
      };
      console.log("¡Reserva Confirmada!", datosReserva);

      this.router.navigate(['/confirmar-evento'], {
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
}
