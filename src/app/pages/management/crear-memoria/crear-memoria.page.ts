import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ToastController, IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/service/http-client';
import { SCHOOLS_DATA, getSchoolCode, getCareerCode } from 'src/app/constants/school-data';
import { addIcons } from 'ionicons';
import { trashOutline, addOutline } from 'ionicons/icons'; // Eliminamos calendarOutline si ya no se usa visualmente

@Component({
  selector: 'app-crear-memoria',
  templateUrl: './crear-memoria.page.html',
  styleUrls: ['./crear-memoria.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    IonicModule
  ]
})
export class CrearMemoriaPage implements OnInit {
  memoriaForm: FormGroup;
  escuelas = Object.keys(SCHOOLS_DATA) as Array<keyof typeof SCHOOLS_DATA>;
  carrerasDisponibles: string[] = [];
  
  // MODIFICADO: Obtenemos solo la parte de la fecha (YYYY-MM-DD)
  fechaActual: string = new Date().toISOString().split('T')[0];

  pdfFile: File | null = null;
  imgFile: File | null = null;
  pdfFileName: string = '';
  imgFileName: string = '';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    addIcons({ trashOutline, addOutline });

    this.memoriaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      profesor: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', Validators.required],
      escuela: ['', Validators.required],
      carrera: ['', Validators.required],
      entidad_involucrada: ['', Validators.required],
      tipo_entidad: ['', Validators.required],
      tipo_memoria: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_termino: ['', Validators.required],
      // SE MANTIENE OCULTO EN LÓGICA: Se inicializa con la fecha formateada YYYY-MM-DD
      fecha_subida: [this.fechaActual, Validators.required],
      integrantes: this.fb.array([])
    });
  }

  ngOnInit() {}
  
  // ... (Resto del código: getters, onEscuelaChange, agregarIntegrante, eliminarIntegrante, onFileSelected) ...
  get integrantes(): FormArray {
    return this.memoriaForm.get('integrantes') as FormArray;
  }
  
  onEscuelaChange(event: any) {
    const escuela = event.detail.value as keyof typeof SCHOOLS_DATA;
    if (SCHOOLS_DATA[escuela]) {
      this.carrerasDisponibles = SCHOOLS_DATA[escuela];
    } else {
      this.carrerasDisponibles = [];
    }
    this.memoriaForm.patchValue({ carrera: '' });
  }

  agregarIntegrante() {
    if (this.integrantes.length >= 10) {
      this.presentToast('Máximo 10 integrantes permitidos.', 'warning');
      return;
    }
    const integranteForm = this.fb.group({
      rut_estudiante: ['', [Validators.required, Validators.pattern(/^\d{1,2}\.\d{3}\.\d{3}-[0-9kK]$|^\d{7,8}-[0-9kK]$/)]],
      nombre_estudiante: ['', Validators.required],
      apellido_estudiante: ['', Validators.required],
      segundo_nombre_estudiante: [''],
      segundo_apellido_estudiante: [''],
      linkedin: [''] 
    });
    this.integrantes.push(integranteForm);
  }

  eliminarIntegrante(index: number) {
    this.integrantes.removeAt(index);
  }

  onFileSelected(event: any, type: 'pdf' | 'img') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'pdf') {
        this.pdfFile = file;
        this.pdfFileName = file.name;
      } else {
        this.imgFile = file;
        this.imgFileName = file.name;
      }
    }
  }

  async confirmarGuardar() {
    if (this.memoriaForm.invalid) {
      this.memoriaForm.markAllAsTouched();
      this.presentToast('Por favor complete los campos obligatorios.', 'danger');
      return;
    }
    if (!this.pdfFile) {
      this.presentToast('El archivo PDF es obligatorio.', 'danger');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirmar creación',
      message: '¿Estás seguro de que deseas agregar esta memoria al repositorio?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Agregar', 
          handler: () => this.guardarMemoria() 
        }
      ]
    });
    await alert.present();
  }

  async confirmarCancelar() {
    const alert = await this.alertCtrl.create({
      header: 'Cancelar',
      message: '¿Deseas cancelar? Los datos no guardados se perderán.',
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Sí, cancelar', handler: () => this.router.navigate(['/proyectos']) }
      ]
    });
    await alert.present();
  }

  guardarMemoria() {
    const formData = new FormData();
    const formValue = this.memoriaForm.value;

    Object.keys(formValue).forEach(key => {
      if (key !== 'integrantes') {
        let value = formValue[key];
        
        // Traducciones
        if (key === 'escuela') value = getSchoolCode(value);
        if (key === 'carrera') value = getCareerCode(value);
        
        formData.append(key, value);
      }
    });

    if (this.pdfFile) formData.append('loc_disco', this.pdfFile);
    if (this.imgFile) formData.append('imagen_display', this.imgFile);

    if (formValue.integrantes.length > 0) {
      formData.append('detalles', JSON.stringify(formValue.integrantes));
    }

    this.api.createMemory(formData).subscribe({
      next: (res) => {
        this.presentToast(`La memoria del proyecto "${res.titulo || 'Nuevo'}" ha sido agregado al repositorio`, 'success');
        this.router.navigate(['/informacion-proyecto', res.id_memo]);
      },
      error: (err) => {
        console.error(err);
        this.presentToast('Error al crear la memoria. Verifique los datos.', 'danger');
      }
    });
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message, duration: 3000, color, position: 'bottom'
    });
    toast.present();
  }
}