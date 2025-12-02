import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterLink, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { 
  IonHeader, IonToolbar, IonButtons, IonMenuButton, IonImg, IonTitle, 
  IonContent, IonGrid, IonRow, IonCol, IonDatetime, IonRange, IonButton, 
  IonIcon, IonSkeletonText, IonText, IonMenu, IonList, IonItem, 
  IonLabel, IonChip, IonAvatar
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, calendarOutline, timeOutline, 
  personCircleOutline, libraryOutline, logOutOutline, 
  homeOutline, folderOpenOutline
} from 'ionicons/icons';

import { FooterComponent } from 'src/app/components/footer/footer.component';
import { SlotService } from 'src/app/service/slot.service'; 

@Component({
  selector: 'app-evento-agendar',
  templateUrl: './evento-agendar.page.html',
  styleUrls: ['./evento-agendar.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink, 
    FooterComponent,
    IonHeader, IonToolbar, IonButtons, IonMenuButton, IonImg, IonTitle, 
    IonContent, IonGrid, IonRow, IonCol, IonDatetime, IonRange, IonButton, 
    IonIcon, IonSkeletonText, IonText, IonMenu, IonList, IonItem, 
    IonLabel, IonChip, IonAvatar
  ]
})
export class EventoAgendarPage implements OnInit, OnDestroy {

  // --- Signals de Estado ---
  selectedDate = signal<string>('');
  selectedDuration = signal<number>(30);
  loadingSlots = signal<boolean>(false);
  
  // Base de datos local del día (Cache): Aquí guardamos los bloques de 30 min crudos
  baseSlots = signal<string[]>([]); 
  
  // Slots filtrados que ve el usuario (Resultado del cálculo local)
  slots = signal<string[]>([]);
  
  selectedSlot = signal<string | null>(null);

  // --- Propiedades ---
  public todayISO: string;
  public maxDateISO: string;
  private routerSubscription!: Subscription;

  selectedWorkspaceIds: string[] | undefined; 
  allSpacesSelected: boolean = false;

  constructor(
    private slotService: SlotService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    addIcons({ 
      arrowBackOutline, calendarOutline, timeOutline, 
      personCircleOutline, libraryOutline, logOutOutline, 
      homeOutline, folderOpenOutline
    });

    const now = new Date();
    this.todayISO = now.toISOString();
    
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    this.maxDateISO = maxDate.toISOString();

    this.selectedDate.set(this.todayISO);
  }

  ngOnInit() {
    this.initPageData();
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.selectedDate()) {
          this.fetchDailyAvailability(); // Solo recarga si cambió la navegación, no la duración
        }
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private initPageData() {
    const navigation = this.router.getCurrentNavigation();
    
    if (navigation?.extras.state) {
      const state = navigation.extras.state as any;
      this.allSpacesSelected = state.allSpaces || false;
      this.selectedWorkspaceIds = (state.workspaceIds && state.workspaceIds.length > 0) 
        ? state.workspaceIds 
        : ['1'];
    } else {
      console.log('Modo directo: Usando Workspace Default ID: 1');
      this.selectedWorkspaceIds = ['1'];
      this.allSpacesSelected = false;
    }
    this.fetchDailyAvailability();
  }

  isDateSelectable = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
    return utcDay !== 0 && utcDay !== 6; 
  };

  // --- MANEJO DE CAMBIOS DE FECHA (Llama a la API) ---
  handleDateChange(event: any) {
    if (this.loadingSlots()) return; 

    const rawValue = event.detail.value;
    const dateValue = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    
    // Solo si la fecha es realmente diferente
    if (dateValue && dateValue.split('T')[0] !== this.selectedDate().split('T')[0]) {
      this.selectedDate.set(dateValue);
      this.selectedSlot.set(null); 
      this.fetchDailyAvailability(); // <--- LLAMA AL BACKEND
    }
  }

  // --- MANEJO DE CAMBIOS DE DURACIÓN (Cálculo Local) ---
  handleDurationChange(event: any) {
    // Aquí NO llamamos a la API, solo recalculamos
    const newDuration = event.detail.value;
    this.selectedDuration.set(newDuration);
    this.selectedSlot.set(null);
    
    // Calculamos usando los datos que ya tenemos en memoria
    this.recalculateSlotsLocally(); 
  }

  selectSlot(slot: string) {
    this.selectedSlot.set(slot);
  }

  // --- LÓGICA DE OBTENCIÓN DE DATOS (API) ---
  async fetchDailyAvailability() {
    const rawDate = this.selectedDate();
    if (!rawDate) return;

    this.loadingSlots.set(true);
    this.slots.set([]); // Limpiamos visualmente
    
    try {
      const fechaLimpia = rawDate.split('T')[0];
      const workspaceIdsNumericos = this.selectedWorkspaceIds?.map(Number);

      console.log('Fetching datos BASE del día:', fechaLimpia);

      // SIEMPRE pedimos bloques de 30 minutos (la unidad mínima) al backend
      // Esto nos permite tener el "mapa completo" del día
      const baseDuration = 30; 

      const allSlots = await this.slotService.getAvailableSlots(
        fechaLimpia,
        baseDuration,
        workspaceIdsNumericos, 
        this.allSpacesSelected,
        true // Force refresh
      );
      
      // Guardamos la respuesta cruda en nuestra "caché" local del día
      this.baseSlots.set(allSlots);
      
      // Ahora calculamos qué mostramos según la duración actual seleccionada
      this.recalculateSlotsLocally();

    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
      this.baseSlots.set([]);
      this.slots.set([]);
    } finally {
      this.loadingSlots.set(false);
    }
  }

  // --- LÓGICA DE CÁLCULO LOCAL (Algoritmo) ---
  recalculateSlotsLocally() {
    const base = this.baseSlots(); // Ejemplo: ['09:00', '09:30', '10:00']
    const duration = this.selectedDuration(); // Ejemplo: 60
    const step = 30; // Los bloques base son de 30 min

    // Si la duración es 30, es igual a la base, mostramos todo
    if (duration === step) {
      this.slots.set(base);
      return;
    }

    // Si la duración es mayor (ej: 60, 90, 120), necesitamos bloques consecutivos
    const blocksNeeded = duration / step; // 60min / 30min = 2 bloques
    const validSlots: string[] = [];

    // Algoritmo: Para cada slot base, miramos si existen los siguientes consecutivos
    for (let i = 0; i < base.length; i++) {
      const startSlot = base[i];
      let isConsecutive = true;

      // Miramos hacia adelante 'blocksNeeded' veces
      for (let j = 1; j < blocksNeeded; j++) {
        // Calculamos cuál debería ser el siguiente horario (ej: 09:00 + 30 = 09:30)
        const nextTime = this.addMinutesToTime(startSlot, step * j);
        
        // Verificamos si ese horario existe en nuestra base disponible
        if (!base.includes(nextTime)) {
          isConsecutive = false;
          break;
        }
      }

      if (isConsecutive) {
        validSlots.push(startSlot);
      }
    }

    console.log(`Recálculo local para ${duration} min. Disponibles:`, validSlots.length);
    this.slots.set(validSlots);
  }

  // Helper para sumar minutos a un string "HH:mm"
  private addMinutesToTime(timeStr: string, minsToAdd: number): string {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + minsToAdd);
    
    // Formatear de vuelta a HH:mm
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  async confirmarReserva() {
    if (!this.selectedSlot()) return;

    this.loadingSlots.set(true); 

    try {
      const fechaLimpia = this.selectedDate().split('T')[0];
      const workspaceIdsNumericos = this.selectedWorkspaceIds?.map(Number);

      // Validación final contra backend (siempre necesaria por seguridad)
      const refreshedBaseSlots = await this.slotService.getAvailableSlots(
        fechaLimpia, 
        30, // Validamos contra base 30
        workspaceIdsNumericos, 
        this.allSpacesSelected, 
        true 
      );

      // Verificamos localmente si con los nuevos datos frescos aún cabe nuestra reserva
      this.baseSlots.set(refreshedBaseSlots);
      this.recalculateSlotsLocally(); // Esto actualiza this.slots()

      if (!this.slots().includes(this.selectedSlot()!)) {
        alert('La hora seleccionada ya no está disponible. Se han actualizado los horarios.');
        this.selectedSlot.set(null);
        return;
      }

      const datosReserva = {
        fecha: fechaLimpia,
        duracion: this.selectedDuration(),
        hora: this.selectedSlot()
      };

      this.router.navigate(['/confirmar-evento'], {
        state: {
          reserva: datosReserva,
          workspaceIds: this.selectedWorkspaceIds 
        }
      });

    } catch (e) {
      console.error('Error:', e);
    } finally {
      this.loadingSlots.set(false);
    }
  }

  logout() {
    this.router.navigate(['/login']);
  }
}