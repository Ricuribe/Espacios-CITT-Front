import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ReactiveFormsModule, 
  FormGroup, 
  FormControl, 
  Validators 
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../service/http-client';
import { 
  IonContent, 
  IonGrid, // <-- Ya no se usa, pero lo dejamos por si acaso
  IonRow, // <-- Ya no se usa
  IonCol, // <-- Ya no se usa
  IonImg, 
  IonItem, 
  IonInput, 
  IonButton, 
  IonIcon, 
  IonText,
  IonToast,
  ToastController,
  
  // --- AÑADIDOS PARA EL NUEVO HEADER ---
  IonHeader,
  IonToolbar,
  IonButtons

} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  eyeOutline, 
  eyeOffOutline, 
  checkmarkCircleOutline, 
  alertCircleOutline,

  // --- AÑADIDO PARA EL BOTÓN DE VOLVER ---
  arrowBackOutline

} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'], 
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    RouterLink,
    IonContent, 
    IonGrid, 
    IonRow, 
    IonCol, 
    IonImg, 
    IonItem, 
    IonInput, 
    IonButton, 
    IonIcon, 
    IonText,
    IonToast,

    // --- AÑADIDOS PARA EL NUEVO HEADER ---
    IonHeader,
    IonToolbar,
    IonButtons
  ]
})
export class LoginPage {

  // --- Inyección de Servicios ---
  private router = inject(Router);
  private toastCtrl = inject(ToastController); 
  private api = inject(ApiService);

  // --- Propiedades ---
  public loginForm: FormGroup;
  public passwordVisible = false;

  constructor() {
    // --- AÑADIDO EL NUEVO ICONO ---
    addIcons({ 
      eyeOutline, 
      eyeOffOutline, 
      checkmarkCircleOutline, 
      alertCircleOutline,
      arrowBackOutline // <-- Añadido
    });

    // 2. Definición del Formulario Reactivo
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl('', [
        Validators.required
      ]),
    });
  }

  // --- Getters ---
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  // --- Métodos de UI ---
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  // --- Lógica Principal ---

  /** Se llama al enviar el formulario */
  async onSubmit() {
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      console.log("Formulario de login inválido");
      return;
    }

    console.log("Datos de Login:", this.loginForm.value);

    // --- Llamada real al API ---
    const emailVal = this.loginForm.value.email;
    const passVal = this.loginForm.value.password;

    this.api.login({ email: emailVal, password: passVal }).subscribe({
      next: (res: any) => {
        // Guardar cada campo en sessionStorage (clave: valor)
        try {
          sessionStorage.setItem('userId', String(res.id ?? ''));
          sessionStorage.setItem('userUsername', res.username ?? '');
          sessionStorage.setItem('userEmail', res.email ?? '');
          sessionStorage.setItem('userFirstName', res.first_name ?? '');
          sessionStorage.setItem('userLastName', res.last_name ?? '');
        } catch (e) {
          console.error('No se pudo escribir en sessionStorage', e);
        }

        this.mostrarAlerta('¡Bienvenido de vuelta!', 'success');
        setTimeout(() => {
          this.router.navigate(['/inicio-usuario']);
        }, 1000);
      },
      error: (err: any) => {
        console.error('Error en el login:', err);
        this.mostrarAlerta('Email o contraseña incorrectos.', 'danger');
        this.password?.reset();
      }
    });
  }

  /**
   * Muestra un mensaje Toast (alerta pop-up)
   */
  async mostrarAlerta(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
      icon: color === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'
    });
    await toast.present();
  }
}