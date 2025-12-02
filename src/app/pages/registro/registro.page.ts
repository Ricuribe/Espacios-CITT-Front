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
  IonImg, 
  IonItem, 
  IonInput, 
  IonButton, 
  IonIcon, 
  IonText,
  IonToast, 
  ToastController,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton // Agregamos por si acaso
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  eyeOutline, 
  eyeOffOutline, 
  arrowBackOutline,
  personOutline,      // Nuevo icono
  mailOutline,        // Nuevo icono
  lockClosedOutline,  // Nuevo icono
  checkmarkCircleOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { ApiService } from 'src/app/service/http-client';

// Importamos tu Footer Component
import { FooterComponent } from 'src/app/components/footer/footer.component';

// --- VALIDATORS (Igual que antes) ---
function duocEmailValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null; 
  const email = control.value.toLowerCase();
  const validDomains = ['@duocuc.cl', '@duoc.cl', '@profesor.duoc.cl'];
  const isValid = validDomains.some(domain => email.endsWith(domain));
  return isValid ? null : { invalidDuocEmail: true };
}

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordsDoNotMatch: true };
}

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
    IonImg, 
    IonItem, 
    IonInput, 
    IonButton, 
    IonIcon, 
    IonText,
    IonToast, 
    IonHeader,
    IonToolbar,
    IonButtons,
    FooterComponent // <--- IMPORTANTE: El footer
  ]
})
export class RegistroPage {

  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private api = inject(ApiService);

  public registroForm: FormGroup;
  public passwordVisible = false;
  public confirmPasswordVisible = false;

  constructor() {
    addIcons({ 
      eyeOutline, 
      eyeOffOutline, 
      arrowBackOutline,
      personOutline,
      mailOutline,
      lockClosedOutline,
      checkmarkCircleOutline,
      alertCircleOutline
    });

    this.registroForm = new FormGroup({
      first_name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      last_name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [Validators.required, Validators.email, duocEmailValidator]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: passwordMatchValidator });
  }

  get first_name() { return this.registroForm.get('first_name'); }
  get last_name() { return this.registroForm.get('last_name'); }
  get email() { return this.registroForm.get('email'); }
  get password() { return this.registroForm.get('password'); }
  get confirmPassword() { return this.registroForm.get('confirmPassword'); }

  togglePasswordVisibility() { this.passwordVisible = !this.passwordVisible; }
  toggleConfirmPasswordVisibility() { this.confirmPasswordVisible = !this.confirmPasswordVisible; }

  async onSubmit() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    const formValues = this.registroForm.value;

    // 1. EXTRAER USERNAME DEL EMAIL (Todo antes del @)
    // Ejemplo: juan.perez@duocuc.cl -> juan.perez
    const username = formValues.email.split('@')[0];

    // 2. PREPARAR EL PAYLOAD PARA DJANGO
    const payload = {
      first_name: formValues.first_name,
      last_name: formValues.last_name,
      email: formValues.email,
      username: username,          // Campo calculado
      password: formValues.password,
      password2: formValues.confirmPassword // Enviamos la confirmación también
    };

    // 3. ENVIAR AL BACKEND
    this.api.register(payload).subscribe({
      next: async (res) => {
        await this.mostrarAlerta('Registro exitoso. Ahora puedes iniciar sesión.', 'success');
        this.router.navigate(['/login']);
      },
      error: async (err) => {
        console.error('Error registro:', err);
        // Manejo básico de errores de Django (ej: username ya existe)
        let msg = 'Error al registrar usuario.';
        if (err.error) {
          if (err.error.email) msg = 'El correo ya está registrado.';
          if (err.error.username) msg = 'El usuario ya existe.';
        }
        await this.mostrarAlerta(msg, 'danger');
      }
    });
  }

  async mostrarAlerta(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message, duration: 3000, position: 'top', color,
      icon: color === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'
    });
    await toast.present();
  }
}