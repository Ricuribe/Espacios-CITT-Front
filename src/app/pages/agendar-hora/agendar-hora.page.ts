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

@Component({
  selector: 'app-agendar-hora',
  templateUrl: './agendar-hora.page.html',
  styleUrls: ['./agendar-hora.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink, IonHeader, IonToolbar, IonImg, IonButtons, 
    IonButton, IonContent, IonGrid, IonRow, IonCol, IonIcon, IonDatetime, 
    IonRange, IonLabel, IonMenu, IonMenuButton, IonList, IonItem, IonTitle 
  ]
})
export class AgendarHoraPage implements OnInit { // <-- CAMBIO 1: Implementa OnInit

  // --- Propiedades y Signals ---
  public today: Date;
  public todayISO: string;
  public maxDateISO: string;
  public selectedDate = signal<string>('');
  public selectedDuration = signal<number>(30);
  public selectedSlot = signal<string | null>(null);

  // ==========================================================
  // CAMBIO 3: Añadir propiedad para guardar el ID
  // ==========================================================
  public workspaceId: number | null = null;


  public availableSlots = computed<string[]>(() => {
    // ... (tu lógica de computed se queda igual) ...
    // ...
    if (!this.selectedDate()) {
      return []; 
    }
    const allSlots_30min = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];
    const allSlots_60min = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];
    const allSlots_90min = ['09:00', '10:30', '14:00', '15:30'];
    let slotsToShow: string[] = [];
    const parts = this.selectedDate().split('-').map(Number);
    const selectedDateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayOfWeek = selectedDateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      slotsToShow = [];
    } else {
      const tomorrow = new Date(this.today);
      tomorrow.setDate(this.today.getDate() + 1);
      const tomorrowISO = `${tomorrow.getFullYear()}-${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}-${tomorrow.getDate().toString().padStart(2, '0')}`;
      if (this.selectedDate() === tomorrowISO) {
        slotsToShow = ['10:00', '11:00', '12:00'];
      } else {
        if (this.selectedDuration() === 30) slotsToShow = allSlots_30min;
        else if (this.selectedDuration() === 60) slotsToShow = allSlots_60min;
        else slotsToShow = allSlots_90min;
      }
    }
    return slotsToShow;
  });

  // ==========================================================
  // CAMBIO 4: Inyectar ActivatedRoute en el constructor
  // ==========================================================
  constructor(
    private router: Router,
    private route: ActivatedRoute // <-- Para leer la URL
  ) { 
    // ... (tu lógica de fechas se queda igual) ...
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
    // --- Leer el ID del espacio al cargar la página ---
    // (Viene de la página 'detalle-espacio' o 'seleccion-espacio')
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.workspaceId = +idParam; // Convierte el string a número
      console.log('ID del espacio a reservar:', this.workspaceId);
    } else {
      console.error('¡Error! No se recibió el ID del espacio.');
      // Aquí podrías redirigir al usuario si falta el ID
    }
  }

  // --- (Tus otras funciones se quedan igual) ---
  handleDateChange(event: any) {
    const newDate = event.detail.value.split('T')[0];
    this.selectedDate.set(newDate);
    this.selectedSlot.set(null);
  }
  handleDurationChange(event: any) {
    const newDuration = event.detail.value;
    this.selectedDuration.set(newDuration);
    this.selectedSlot.set(null);
  }
  selectSlot(slot: string) {
    this.selectedSlot.set(slot);
    console.log(`Fecha: ${this.selectedDate()}, Duración: ${this.selectedDuration()} min, Hora: ${this.selectedSlot()}`);
  }

  
  /** Se llama al hacer clic en el botón final */
  confirmarReserva() {
    if (!this.selectedSlot() || !this.workspaceId) {
      console.error("Debe seleccionar una hora y debe existir un ID de espacio");
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

    // ==========================================================
    // CAMBIO 5: Enviar los 'datosReserva' a la siguiente página
    // ==========================================================
    this.router.navigate(['/confirmar-solicitud'], {
      state: {
        reserva: datosReserva // <-- ¡Aquí pasamos los datos!
      }
    });
  }
}

