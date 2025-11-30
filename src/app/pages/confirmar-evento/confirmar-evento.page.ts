import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonButtons, IonMenuButton, IonImg, IonTitle, 
  IonContent, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonCard, 
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, 
  IonItem, IonLabel, IonInput, IonTextarea, IonMenu, IonSkeletonText, 
  IonText, IonChip, IonAvatar, AlertController, MenuController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, calendarOutline, timeOutline, 
  peopleOutline, checkmarkCircleOutline, documentTextOutline,
  personCircleOutline, logOutOutline, homeOutline, folderOpenOutline, libraryOutline
} from 'ionicons/icons';
import { ApiService } from 'src/app/service/http-client';
import { FooterComponent } from 'src/app/components/footer/footer.component';

@Component({
  selector: 'app-confirmar-evento',
  templateUrl: './confirmar-evento.page.html',
  styleUrls: ['./confirmar-evento.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, FooterComponent,
    IonHeader, IonToolbar, IonButtons, IonMenuButton, IonImg, IonTitle, 
    IonContent, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonCard, 
    IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, 
    IonItem, IonLabel, IonInput, IonTextarea, IonMenu, IonSkeletonText, 
    IonText, IonChip, IonAvatar
  ]
})
export class ConfirmarEventoPage implements OnInit {

  // Inyecciones
  public router = inject(Router); // Público para usar en HTML si es necesario
  private apiService = inject(ApiService);
  private alertCtrl = inject(AlertController);
  private menuCtrl = inject(MenuController);

  // Estado
  public reserva: any = null;
  public workspaceIds: number[] = [];
  public isLoading = false;
  public userName: string = '';

  // Formulario
  public form = {
    title: '',
    description: '',
    attendees: 1
  };

  constructor() {
    addIcons({ 
      arrowBackOutline, calendarOutline, timeOutline, 
      peopleOutline, checkmarkCircleOutline, documentTextOutline,
      personCircleOutline, logOutOutline, homeOutline, folderOpenOutline, libraryOutline
    });
  }

  ngOnInit() {
    this.loadSessionData();
    
    // Obtener datos pasados desde 'evento-agendar'
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;

    if (state && state.reserva) {
      this.reserva = state.reserva;
      this.workspaceIds = state.workspaceIds || [];
      console.log('Datos recibidos:', this.reserva);
    } else {
      // Fallback para desarrollo (evita pantalla en blanco al recargar)
      this.reserva = {
        fecha: new Date().toISOString(),
        hora: '10:00',
        duracion: 60
      };
    }
  }

  ionViewWillEnter() {
    // Usamos el mismo menú que en inicio
    this.menuCtrl.enable(true, 'menu-confirmar');
  }

  loadSessionData() {
    const name = sessionStorage.getItem('userFirstName');
    const last = sessionStorage.getItem('userLastName');
    if (name) {
      this.userName = `${name} ${last || ''}`;
    }
  }

  async confirmarFinal() {
    if (!this.form.title.trim()) {
      const alert = await this.alertCtrl.create({
        header: 'Faltan datos',
        message: 'Por favor ingresa un título para tu evento.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    this.isLoading = true;

    // Construir payload para la API
    // Ajusta estos campos según lo que espere tu backend exactamente
    const payload = {
      title: this.form.title,
      description: this.form.description,
      start_datetime: this.combinarFechaHora(this.reserva.fecha, this.reserva.hora),
      // Calculamos fin sumando duración
      end_datetime: this.calcularFin(this.reserva.fecha, this.reserva.hora, this.reserva.duracion),
      attendees: this.form.attendees,
      spaces: this.reserva.espacios || this.workspaceIds || []
    };

    console.log('Enviando reserva:', payload);

    this.apiService.creeateEvent(payload).subscribe({
      next: async (res) => {
        this.isLoading = false;
        const alert = await this.alertCtrl.create({
          header: '¡Éxito!',
          message: 'Tu reserva ha sido creada correctamente.',
          buttons: [{
            text: 'Ir al Inicio',
            handler: () => this.router.navigate(['/inicio-usuario'])
          }]
        });
        await alert.present();
      },
      error: async (err) => {
        this.isLoading = false;
        console.error(err);
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo crear la reserva. Intenta de nuevo.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  // Helpers de fecha
  private combinarFechaHora(fechaIso: string, horaStr: string): string {
    // fechaIso: "2025-11-18T..."
    // horaStr: "10:30"
    const datePart = fechaIso.split('T')[0];
    return `${datePart}T${horaStr}:00`;
  }

  private calcularFin(fechaIso: string, horaStr: string, duracionMin: number): string {
    const inicio = new Date(this.combinarFechaHora(fechaIso, horaStr));
    const fin = new Date(inicio.getTime() + duracionMin * 60000);
    
    // Formatear a ISO string local o lo que pida tu backend
    // Simple ISO:
    return fin.toISOString().split('.')[0]; // Quita milisegundos si molestan
  }

  volver() {
    this.router.navigate(['/evento-agendar']);
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/home']);
  }
}