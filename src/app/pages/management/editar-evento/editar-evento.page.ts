import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, 
  IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonTextarea, 
  IonDatetimeButton, IonModal, IonDatetime, IonSelect, IonSelectOption, 
  IonButton, IonSpinner, IonNote, IonText, IonIcon, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircle } from 'ionicons/icons';
import { ApiService } from 'src/app/service/http-client';

@Component({
  selector: 'app-editar-evento',
  templateUrl: './editar-evento.page.html',
  styleUrls: ['./editar-evento.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, IonContent, IonHeader, IonToolbar, 
    IonButtons, IonBackButton, IonTitle, IonCard, IonCardContent, IonItem, 
    IonLabel, IonInput, IonTextarea, IonDatetimeButton, IonModal, IonDatetime, 
    IonSelect, IonSelectOption, IonButton, IonSpinner, IonNote, IonText, IonIcon
  ]
})
export class EditarEventoPage implements OnInit {
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private toastCtrl = inject(ToastController);

  public eventId: number = 0;
  public eventForm!: FormGroup;
  public isLoading = signal<boolean>(true);
  public isSaving = signal<boolean>(false);
  public timeSlots: string[] = []; // Generados cada 30 min

  constructor() {
    addIcons({ alertCircle });
    this.generateTimeSlots();
  }

  ngOnInit() {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    if (this.eventId) {
      this.loadEventData();
    }
  }

  generateTimeSlots() {
    // Generar slots de 08:00 a 22:00 cada 30 min
    const startHour = 8;
    const endHour = 22;
    for (let h = startHour; h <= endHour; h++) {
      this.timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
      if (h !== endHour) this.timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
    }
  }

  initForm() {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required]],
      date: [new Date().toISOString(), Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    }, { validators: this.timeRangeValidator });
  }

  // Validador personalizado para rango de horas
  timeRangeValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;
    if (start && end && start >= end) {
      return { invalidTimeRange: true };
    }
    return null;
  }

  get f() { return this.eventForm.controls; }

  loadEventData() {
    this.isLoading.set(true);
    this.api.getManagementEventById(this.eventId).subscribe({
      next: (data: any) => {
        // Parsear fechas y horas del backend
        const startDt = new Date(data.start_datetime);
        const endDt = new Date(data.end_datetime);
        
        // Ajustar la hora de fin sumando 1 minuto para visualización (porque guardamos como :59)
        // Ejemplo: Backend tiene 10:59 -> Frontend muestra 11:00
        // Ojo: Si el backend tiene :59, al traerlo sumamos 1 min para que calce con el slot :00 o :30
        if (endDt.getSeconds() === 59 || endDt.getSeconds() === 0) {
           // Simplemente redondeamos al slot más cercano
           this.roundToNearestSlot(endDt);
        }

        this.eventForm.patchValue({
          title: data.title,
          description: data.description,
          date: startDt.toISOString(),
          startTime: this.formatTimeForSelect(startDt),
          endTime: this.formatTimeForSelect(endDt)
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.presentToast('Error al cargar datos del evento', 'danger');
        this.router.navigate(['/management/gestionar-eventos']);
      }
    });
  }

  roundToNearestSlot(date: Date) {
    // Lógica simple: si min > 45 -> siguiente hora :00, si min > 15 -> :30
    const m = date.getMinutes();
    if (m === 59) {
      date.setMinutes(date.getMinutes() + 1); // Subir al sgte minuto exacto
    }
  }

  formatTimeForSelect(date: Date): string {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  saveEvent() {
    if (this.eventForm.invalid) return;

    this.isSaving.set(true);
    const val = this.eventForm.value;

    // Construir objetos Date
    // La fecha base viene del datepicker
    const baseDate = new Date(val.date);
    const y = baseDate.getFullYear();
    const m = baseDate.getMonth();
    const d = baseDate.getDate();

    const [sh, sm] = val.startTime.split(':').map(Number);
    const [eh, em] = val.endTime.split(':').map(Number);

    const startDateTime = new Date(y, m, d, sh, sm, 0);
    const endDateTime = new Date(y, m, d, eh, em, 0);

    // RESTAR 1 MINUTO A LA HORA DE TÉRMINO
    // Para que termine en :59 o :29 y no choque con el inicio del siguiente bloque
    endDateTime.setMinutes(endDateTime.getMinutes() - 1);

    const payload = {
      title: val.title,
      description: val.description,
      start_datetime: startDateTime.toISOString(),
      end_datetime: endDateTime.toISOString()
      // Otros campos que tu backend requiera
    };

    this.api.updateManagementEvent(this.eventId, payload).subscribe({
      next: () => {
        this.presentToast('Evento actualizado correctamente', 'success');
        this.router.navigate(['/management/gestionar-eventos']);
      },
      error: (err) => {
        console.error(err);
        this.presentToast('Error al actualizar el evento', 'danger');
        this.isSaving.set(false);
      }
    });
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, color: color, duration: 2000 });
    t.present();
  }
}