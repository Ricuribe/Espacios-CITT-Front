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

import { FooterComponent } from 'src/app/components/footer/footer.component';

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

  private router = inject(Router);
  private toastCtrl = inject(ToastController); 
  private api = inject(ApiService);
  private menuCtrl = inject(MenuController);

  public loginForm: FormGroup;
  public passwordVisible = false;

  constructor() {
    addIcons({ 
      eyeOutline, eyeOffOutline, checkmarkCircleOutline, 
      alertCircleOutline, arrowBackOutline, mailOutline, lockClosedOutline
    });

    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(false); 
  }

  ionViewWillLeave() {
    this.menuCtrl.enable(true, 'menu-home'); 
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  async onSubmit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;

    const emailVal = this.loginForm.value.email;
    const passVal = this.loginForm.value.password;

    this.api.login({ email: emailVal, password: passVal }).subscribe({
      next: (res: any) => {
        try {
          sessionStorage.setItem('userId', String(res.id ?? ''));
          sessionStorage.setItem('userUsername', res.username ?? '');
          sessionStorage.setItem('userEmail', res.email ?? '');
          sessionStorage.setItem('userFirstName', res.first_name ?? '');
          sessionStorage.setItem('userLastName', res.last_name ?? '');
          if(res.role) sessionStorage.setItem('userRole', res.role);
        } catch (e) {
          console.error('Error storage', e);
        }
        this.mostrarAlerta('¡Bienvenido!', 'success');
        setTimeout(() => { this.router.navigate(['/inicio-usuario']); }, 1000);
      },
      error: (err: any) => {
        console.error('Login error:', err);
        this.mostrarAlerta('Credenciales incorrectas.', 'danger');
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