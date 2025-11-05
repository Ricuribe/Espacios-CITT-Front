import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ReactiveFormsModule, 
  FormGroup, 
  FormControl, 
  Validators 
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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

    // --- SIMULACIÓN DE API ---
    const emailVal = this.loginForm.value.email;
    const passVal = this.loginForm.value.password;

    // SIMULACIÓN DE ÉXITO
    if (emailVal === 'test@duoc.cl' && passVal === '123456') {
      this.mostrarAlerta('¡Bienvenido de vuelta!', 'success');
      setTimeout(() => {
        this.router.navigate(['/inicio-usuario']); 
      }, 1000);
    } 
    // SIMULACIÓN DE ERROR
    else {
      console.error("Error en el login: datos incorrectos");
      this.mostrarAlerta('Email o contraseña incorrectos.', 'danger');
      this.password?.reset();
    }
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