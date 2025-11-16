import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Importante para el ion-toggle
import { ActivatedRoute, Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonDatetime, IonItem, IonLabel, IonRange, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonList, IonMenu, IonImg, IonMenuButton, IonSkeletonText } from '@ionic/angular/standalone';
import { SlotService } from 'src/app/service/slot.service';

@Component({
  selector: 'app-evento-agendar',
  templateUrl: './evento-agendar.page.html',
  styleUrls: ['./evento-agendar.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  ],


})
export class EventoAgendarPage implements OnInit, OnDestroy {

 // --- Propiedades y Signals ---
  public today: Date;
  public todayISO: string;
  public maxDateISO: string;
  public selectedDate = signal<string>('');
  public selectedDuration = signal<number>(30);
  public selectedSlot = signal<string | null>(null);
  public slots = signal<string[]>([]);
  public loadingSlots = signal<boolean>(false);
  public selectedWorkspaceIds: number[] = [];
  public allSpacesSelected = false;
  private previousNavKey: string | null = null;
  private routerEventsSub?: Subscription;

  // Decide whether a date is selectable by the calendar (true = selectable).
  // Disables Saturdays (6) and Sundays (0).
  public isDateSelectable = (isoDate?: string | null) => {
    if (!isoDate) return false;
    const datePart = isoDate.split('T')[0];
    const parts = datePart.split('-').map(Number);
    if (parts.length < 3) return false;
    const dt = new Date(parts[0], parts[1] - 1, parts[2]);
    const day = dt.getDay();
    return day !== 0 && day !== 6;
  };

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
    // Leer estado de navegación actual (puede venir de Router navigation extras o de history.state)
    const navigation = this.router.getCurrentNavigation();
    const navState = navigation?.extras?.state ?? (history && (history.state || {}));
    this.applyNavigationState(navState, true);

    // Suscribirse a re-entradas en la ruta para detectar cambios en la selección
    this.routerEventsSub = this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        // Cuando la navegación termina, leer el history.state (incluye state enviado por Router.navigate)
        const s = history && (history.state || {});
        this.applyNavigationState(s, false);
      }
    });
  }

  ngOnDestroy() {
    this.routerEventsSub?.unsubscribe();
  }

  /** Aplica el state de navegación y refresca slots si la selección cambió */
  private applyNavigationState(state: any, forceRefresh: boolean) {
    if (!state) return;
    const ids: number[] = state['workspaceIds'] ?? [];
    const all = !!state['allSpaces'];

    const key = `all:${all}|ids:${(ids || []).slice().sort((a,b)=>a-b).join(',')}`;
    const changed = this.previousNavKey !== key;

    this.selectedWorkspaceIds = ids;
    this.allSpacesSelected = all;
    this.previousNavKey = key;

    if (changed || forceRefresh) {
      if (!this.selectedWorkspaceIds.length && !this.allSpacesSelected) {
        console.error('No se recibieron workspaceIds ni se marcó allSpaces; esto no debería ocurrir.');
      }
      console.log('Espacios seleccionados:', this.selectedWorkspaceIds, 'allSpaces:', this.allSpacesSelected);
      // refresh slots when selection changed (force true to re-fetch activities)
      this.updateSlots(true);
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
      // If user selected specific workspaces, pass their IDs; otherwise request global activities
      const workspaceParam = this.selectedWorkspaceIds && this.selectedWorkspaceIds.length ? this.selectedWorkspaceIds : undefined;
      const available = await this.slotService.getAvailableSlots(this.selectedDate(), this.selectedDuration(), workspaceParam, this.allSpacesSelected, forceRefresh);
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
      const workspaceParam = this.selectedWorkspaceIds && this.selectedWorkspaceIds.length ? this.selectedWorkspaceIds : undefined;
      const refreshed = await this.slotService.getAvailableSlots(this.selectedDate(), this.selectedDuration(), workspaceParam, this.allSpacesSelected, true);
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
          reserva: datosReserva,
          workspaceIds: this.selectedWorkspaceIds
        }
      });
    } catch (e) {
      console.error('Error validando disponibilidad antes de confirmar:', e);
    } finally {
      this.loadingSlots.set(false);
    }
  }
}
