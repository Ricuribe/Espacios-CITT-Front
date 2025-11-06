import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Importante para el ion-toggle
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonDatetime, IonItem, IonLabel, IonToggle, IonCard, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonFooter, IonSpinner, IonRange, IonList, IonMenu, IonImg, IonMenuButton } from '@ionic/angular/standalone';
import { ApiService } from 'src/app/service/http-client';
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
  imports: [CommonModule,
    FormsModule, // <-- Necesario para [(ngModel)]
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonBackButton,
    IonButtons,
    IonDatetime,
    IonItem,
    IonLabel,
    IonToggle,
    IonCard,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonFooter,
    IonSpinner,
    CommonModule,
    IonRange,
    RouterLink, IonList, IonMenu, IonImg, IonMenuButton]
})
export class EventoAgendarPage implements OnInit {

 // --- Propiedades y Signals ---
  public today: Date;
  public todayISO: string;
  public maxDateISO: string;
  public selectedDate = signal<string>('');
  public selectedDuration = signal<number>(30);
  public selectedSlot = signal<string | null>(null);


  public availableSlots = computed<string[]>(() => {

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


  constructor(
    private router: Router,
    private route: ActivatedRoute
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
    
      //this.router.navigate(['/']);
    
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
    if (!this.selectedSlot()) {
      console.error("Debe seleccionar una hora");
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
  }
}
