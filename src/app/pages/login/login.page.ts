import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ReactiveFormsModule, 
  FormGroup, 
  FormControl, 
  Validators 
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from 'src/app/service/http-client'; 
import { 
  IonContent, 
  IonImg, 
  IonItem, 
  IonInput, 
  IonButton, 
  IonIcon, 
  IonText,
  ToastController,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  MenuController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  eyeOutline, 
  eyeOffOutline, 
  arrowBackOutline,
  mailOutline,       
  lockClosedOutline, 
  checkmarkCircleOutline, 
  alertCircleOutline
} from 'ionicons/icons';

// Importamos el AuthService para gestionar la sesión real
import { AuthService } from 'src/app/service/auth.service';
import { FooterComponent } from "src/app/components/footer/footer.component";

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
    IonImg,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    FooterComponent
]
})
export class LoginPage {
  loginForm: FormGroup;
  passwordVisible: boolean = false;

  constructor(
    private api: ApiService, 
    private router: Router, 
    private toastController: ToastController,
    private authService: AuthService // <--- Inyectamos el AuthService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required, 
        Validators.email,
        Validators.pattern('^[a-z0-9._%+-]+@duocuc\\.cl$|^[a-z0-9._%+-]+@profesor\\.duoc\\.cl$|^[a-z0-9._%+-]+@duoc\\.cl$')
      ]),
      password: new FormControl('', [Validators.required])
    });

    addIcons({ 
      eyeOutline, 
      eyeOffOutline, 
      arrowBackOutline,
      mailOutline, 
      lockClosedOutline,
      checkmarkCircleOutline,
      alertCircleOutline
    });
  }

  // Getters para facilitar el acceso en el HTML
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  async onSubmit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    // 1. Llamamos a la API para verificar credenciales
    this.api.login(credentials).subscribe({
      next: async (res: any) => {
        try {
          // Validamos que la respuesta tenga lo necesario
          if (res.access && res.refresh) {
            
            // 2. CONECTAMOS CON AUTHSERVICE
            // Usamos el usuario que viene en la respuesta, o 'res' si viene plano
            // y pasamos los tokens para que se guarden en Storage
            const user = res.user || res; 
            
            await this.authService.login(user, { 
              access: res.access, 
              refresh: res.refresh 
            });

            this.mostrarAlerta('¡Bienvenido!', 'success');
            
            // 3. Redirección protegida
            setTimeout(() => { 
              this.router.navigate(['/inicio-usuario']); 
            }, 1000);

          } else {
            console.error('Estructura de respuesta inválida:', res);
            this.mostrarAlerta('Error: Respuesta del servidor incompleta', 'danger');
          }

        } catch (e) {
          console.error('Error guardando sesión:', e);
          this.mostrarAlerta('Error al guardar la sesión.', 'danger');
        }
      },
      error: (err: any) => {
        console.error('Login error:', err);
        // Mensaje amigable según el error
        const msg = err.status === 401 
          ? 'Credenciales incorrectas.' 
          : 'Error de conexión con el servidor.';
        this.mostrarAlerta(msg, 'danger');
      }
    });
  }

  async mostrarAlerta(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom',
      icon: color === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'
    });
    await toast.present();
  }
}