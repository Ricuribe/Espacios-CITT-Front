import { Component, signal } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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

  // --- AÑADIDOS PARA EL MENÚ ---
  IonMenu,
  IonMenuButton,
  IonList,
  IonItem,
  IonTitle // <-- AÑADE ESTA LÍNEA
  // --- FIN DE AÑADIDOS ---

} from '@ionic/angular/standalone';

@Component({
  selector: 'app-agendar-hora',
  templateUrl: './agendar-hora.page.html',
  styleUrls: ['./agendar-hora.page.scss'],
  standalone: true,
  
  imports: [
    CommonModule,
    RouterLink, 
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

    // --- AÑADIDOS PARA EL MENÚ ---
    IonMenu,
    IonMenuButton,
    IonList,
    IonItem,
    IonTitle // <-- Y AÑADE ESTA LÍNEA AQUÍ TAMBIÉN
    // --- FIN DE AÑADIDOS ---
  ]
})
export class AgendarHoraPage {

  // --- LÓGICA DEL CALENDARIO ---

  // 1. Configuración de Fechas
  public today: Date;
  public todayISO: string;
  public maxDateISO: string;

  // 2. Signals para rastrear el estado
  public selectedDate = signal<string>('');
  public selectedDuration = signal<number>(30);
  public availableSlots = signal<string[]>([]);
  public selectedSlot = signal<string | null>(null);

  constructor() {
    // --- Configura las fechas MIN y MAX ---
    this.today = new Date();
    
    // --- INICIO DE LA CORRECCIÓN ---
    // NO USAR .toISOString() porque convierte a UTC y puede saltar el día.
    // Creamos el string 'YYYY-MM-DD' manualmente usando la fecha local.
    
    const year = this.today.getFullYear();
    // getMonth() es 0-indexado (0 = Ene), por eso +1
    const month = (this.today.getMonth() + 1).toString().padStart(2, '0');
    const day = this.today.getDate().toString().padStart(2, '0');
    
    this.todayISO = `${year}-${month}-${day}`; // Ej: "2025-11-03" (Día local correcto)
    // --- FIN DE LA CORRECCIÓN ---

    
    // Setea la fecha máxima (ej. 3 meses desde hoy)
    const maxDate = new Date(this.today);
    maxDate.setMonth(this.today.getMonth() + 3);
    
    // --- APLICAR MISMA LÓGICA AL MAX-DATE ---
    const maxYear = maxDate.getFullYear();
    const maxMonth = (maxDate.getMonth() + 1).toString().padStart(2, '0');
    const maxDay = maxDate.getDate().toString().padStart(2, '0');
    this.maxDateISO = `${maxYear}-${maxMonth}-${maxDay}`;
    // --- FIN DE LA CORRECCIÓN ---

    // --- Estado Inicial ---
    this.selectedDate.set(this.todayISO); // Selecciona hoy por defecto
    this.updateAvailableSlots(); // Carga las horas para "hoy" al iniciar
  }

  // --- MANEJADORES DE EVENTOS ---

  /** Se llama cuando el usuario cambia la fecha en ion-datetime */
  handleDateChange(event: any) {
    // El valor ya viene como ISO string (YYYY-MM-DD)
    const newDate = event.detail.value.split('T')[0];
    this.selectedDate.set(newDate);
    this.selectedSlot.set(null); // Resetea la hora seleccionada
    this.updateAvailableSlots();
  }

  /** Se llama cuando el usuario cambia el slider de duración */
  handleDurationChange(event: any) {
    const newDuration = event.detail.value;
    this.selectedDuration.set(newDuration);
    this.selectedSlot.set(null); // Resetea la hora seleccionada
    this.updateAvailableSlots();
  }

  /** Se llama al hacer clic en un botón de hora */
  selectSlot(slot: string) {
    this.selectedSlot.set(slot);
    console.log(`Fecha: ${this.selectedDate()}, Duración: ${this.selectedDuration()} min, Hora: ${this.selectedSlot()}`);
  }

  // --- LÓGICA PRINCIPAL (Simulación de Backend) ---

  /**
   * Esta función simula una llamada a un backend para obtener
   * las horas disponibles basadas en la fecha y duración.
   */
  updateAvailableSlots() {
    console.log(`Buscando horas para: ${this.selectedDate()} con duración de ${this.selectedDuration()} min`);

    // SIMULACIÓN: Genera horas diferentes basadas en el día
    const allSlots_30min = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];
    const allSlots_60min = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];
    const allSlots_90min = ['09:00', '10:30', '14:00', '15:30'];
    
    let slotsToShow: string[] = [];

    // Lógica de simulación
    // Días de semana tienen horas, fines de semana no.
    // IMPORTANTE: Creamos la fecha así para evitar problemas de zona horaria 
    // al interpretar el string YYYY-MM-DD.
    const parts = this.selectedDate().split('-').map(Number);
    const selectedDateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayOfWeek = selectedDateObj.getDay();
    
    if (dayOfWeek === 0 || dayOfWeek === 6) { // 0 = Domingo, 6 = Sábado
      slotsToShow = []; // Fines de semana no hay horas
    } else {
      // Simula que "mañana" tiene menos horas
      const tomorrow = new Date(this.today);
      tomorrow.setDate(this.today.getDate() + 1);
      const tomorrowISO = `${tomorrow.getFullYear()}-${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}-${tomorrow.getDate().toString().padStart(2, '0')}`;
      
      if (this.selectedDate() === tomorrowISO) {
        slotsToShow = ['10:00', '11:00', '12:00']; // Mañana tiene pocas horas
      } else {
        // Elige el array de horas basado en la duración
        if (this.selectedDuration() === 30) slotsToShow = allSlots_30min;
        else if (this.selectedDuration() === 60) slotsToShow = allSlots_60min;
        else slotsToShow = allSlots_90min;
      }
    }
    
    this.availableSlots.set(slotsToShow);
  }
  
  /** Se llama al hacer clic en el botón final */
  confirmarReserva() {
    if (!this.selectedSlot()) {
      console.error("Debe seleccionar una hora");
      return;
    }
    console.log("¡Reserva Confirmada!", {
      fecha: this.selectedDate(),
      duracion: this.selectedDuration(),
      hora: this.selectedSlot()
    });
    // Navegar a la página de confirmación...
  }
}



