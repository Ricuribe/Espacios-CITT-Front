import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterLink, ActivatedRoute, NavigationEnd } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonButtons, IonMenuButton, IonImg, IonTitle, 
  IonContent, IonGrid, IonRow, IonCol, IonDatetime, IonRange, IonButton, 
  IonIcon, IonSkeletonText, IonText, MenuController, IonMenu, IonList, 
  IonItem, IonLabel, IonChip, IonAvatar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, calendarOutline, timeOutline, 
  personCircleOutline, libraryOutline, logOutOutline, 
  homeOutline, folderOpenOutline
} from 'ionicons/icons';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { ApiService } from 'src/app/service/http-client';

@Component({
  selector: 'app-evento-agendar',
  templateUrl: './evento-agendar.page.html',
  styleUrls: ['./evento-agendar.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, FooterComponent,
    IonHeader, IonToolbar, IonButtons, IonMenuButton, IonImg, IonTitle, 
    IonContent, IonGrid, IonRow, IonCol, IonDatetime, IonRange, IonButton, 
    IonIcon, IonSkeletonText, IonText, IonMenu, IonList, IonItem, IonLabel,
    IonChip, IonAvatar
  ]
})
export class EventoAgendarPage implements OnInit {

  private router = inject(Router);
  private menuCtrl = inject(MenuController);
  // private slotService = inject(SlotService); // Descomenta si usas tu servicio real

  // --- ESTADO ---
  public userName = signal<string>('');
  
  // --- VARIABLES DE AGENDAMIENTO ---
  public todayISO: string;
  public maxDateISO: string;
  
  public selectedDate = signal<string>('');
  public selectedDuration = signal<number>(60); // Default 60 min
  public selectedSlot = signal<string | null>(null);
  
  public slots = signal<string[]>([]);
  public loadingSlots = signal<boolean>(false);
  
  // Datos recibidos de la selección de espacios
  public selectedWorkspaceIds: number[] = [];
  public allSpacesSelected = false;

  // Filtro de fechas (No fines de semana)
  public isDateSelectable = (isoDateString: string) => {
    const date = new Date(isoDateString);
    const day = date.getUTCDay();
    return day !== 0 && day !== 6;
  };

  constructor() {
    addIcons({ 
      arrowBackOutline, calendarOutline, timeOutline,
      personCircleOutline, libraryOutline, logOutOutline,
      homeOutline, folderOpenOutline
    });

    // Configurar fechas
    const today = new Date();
    this.todayISO = today.toISOString();
    
    const maxDate = new Date(today);
    maxDate.setMonth(today.getMonth() + 3);
    this.maxDateISO = maxDate.toISOString();
    
    this.selectedDate.set(this.todayISO);
  }

  ngOnInit() {
    this.checkLogin();
    this.recoverNavigationState();
    this.generateSlots(); // Carga inicial de horarios
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'menu-agendar');
  }

  checkLogin() {
    const name = sessionStorage.getItem('userFirstName');
    if (name) this.userName.set(name);
  }

  recoverNavigationState() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;
    
    if (state) {
      this.selectedWorkspaceIds = state['workspaceIds'] || [];
      this.allSpacesSelected = !!state['allSpaces'];
    }
  }

  handleDateChange(event: any) {
    const val = event.detail.value;
    const newDate = (typeof val === 'string') ? val.split('T')[0] : val;
    this.selectedDate.set(newDate);
    this.selectedSlot.set(null);
    this.generateSlots(); // Recargar horas al cambiar fecha
  }

  handleDurationChange(event: any) {
    this.selectedDuration.set(event.detail.value);
    this.selectedSlot.set(null);
    // Si tu lógica depende de la duración, llama a generateSlots() aquí también
  }

  selectSlot(slot: string) {
    this.selectedSlot.set(slot);
  }

  // --- AQUÍ ESTÁ LA MAGIA DE LOS HORARIOS ---
  // (Usamos esto para que la vista funcione YA. Si tienes tu backend listo, reemplaza esto)
  generateSlots() {
    this.loadingSlots.set(true);
    this.slots.set([]);

    // Simulamos una carga de red
    setTimeout(() => {
      // Generamos horas de ejemplo
      const mockSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30'
      ];
      this.slots.set(mockSlots);
      this.loadingSlots.set(false);
    }, 600);
  }

  // --- BOTÓN CONFIRMAR (AHORA SÍ FUNCIONA) ---
  confirmarReserva() {
    if (!this.selectedSlot()) return;

    const datosReserva = {
      fecha: this.selectedDate(),
      hora: this.selectedSlot(),
      duracion: this.selectedDuration(),
      espacios: this.selectedWorkspaceIds,
      allSpaces: this.allSpacesSelected
    };
    
    console.log('Navegando a confirmación con:', datosReserva);

    // Navegación correcta pasando el estado
    this.router.navigate(['/confirmar-evento'], {
      state: {
        reserva: datosReserva
      }
    });
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/home']);
  }
}