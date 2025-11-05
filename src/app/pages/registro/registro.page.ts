import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ReactiveFormsModule, 
  FormGroup, 
  FormControl, 
  Validators, 
  AbstractControl, 
  ValidationErrors 
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonGrid, // <-- Ya no se usa
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

// --- INICIO DEL VALIDADOR PERSONALIZADO ---
function duocEmailValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null; 
  }
  const email = control.value.toLowerCase();
  const validDomains = ['@duocuc.cl', '@duoc.cl', '@profesor.duoc.cl'];
  const isValid = validDomains.some(domain => email.endsWith(domain));
  return isValid ? null : { invalidDuocEmail: true };
}

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (password !== confirmPassword) {
    control.get('confirmPassword')?.setErrors({ passwordsDoNotMatch: true });
    return { passwordsDoNotMatch: true };
  } else {
    if (control.get('confirmPassword')?.hasError('passwordsDoNotMatch')) {
      control.get('confirmPassword')?.setErrors(null);
    }
    return null;
  }
}
// --- FIN DE VALIDADORES ---

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
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
export class RegistroPage {

  // --- Inyección de Servicios ---
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  // --- Propiedades del Componente ---
  public registroForm: FormGroup;
  public passwordVisible = false;
  public confirmPasswordVisible = false;

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
    this.registroForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        duocEmailValidator 
      ]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { 
      validators: passwordMatchValidator 
    });
  }

  // --- Getters ---
  get nombre() { return this.registroForm.get('nombre'); }
  get email() { return this.registroForm.get('email'); }
  get password() { return this.registroForm.get('password'); }
  get confirmPassword() { return this.registroForm.get('confirmPassword'); }

  // --- Métodos de UI ---
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  // --- Lógica Principal ---
  async onSubmit() {
    this.registroForm.markAllAsTouched();
    if (this.registroForm.invalid) {
      console.log("Formulario inválido");
      return;
    }
    console.log("Formulario Válido:", this.registroForm.value);
    
    // --- SIMULACIÓN DE API ---
    // (Aquí llamarías a tu backend para registrar al usuario)
    
    // Simulación de éxito
    this.mostrarAlerta('¡Cuenta creada con éxito! (Simulación)', 'success');
    
    // Redirige al login después de 2 segundos
    setTimeout(() => {
      this.router.navigate(['/login']); 
    }, 2000);

    /*
    // Simulación de error (ej. email ya existe)
    setTimeout(() => {
      this.mostrarAlerta('Este email ya está registrado.', 'danger');
    }, 1000);
    */
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