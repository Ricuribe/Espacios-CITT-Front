import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ToastController, IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/service/http-client';
import { SCHOOLS_DATA, getSchoolCode, getCareerCode } from 'src/app/constants/schools-data';
import { addIcons } from 'ionicons';
import { trashOutline, addOutline } from 'ionicons/icons'; 

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
      descripcion: ['', [Validators.required, Validators.maxLength(5000)]],
      escuela: ['', Validators.required],
      carrera: ['', Validators.required],
      entidad_involucrada: ['', [Validators.required, Validators.maxLength(100)]],
      tipo_entidad: ['', [Validators.required, Validators.maxLength(50)]],
      tipo_memoria: ['', [Validators.required, Validators.maxLength(50)]],
      fecha_inicio: ['', Validators.required],
      fecha_termino: ['', Validators.required],
      fecha_subida: [this.fechaActual, Validators.required],
      integrantes: this.fb.array([])
    }, { validators: this.dateRangeValidator }); // Validación global del grupo
  }

  ngOnInit() {}
  
  // --- VALIDACIÓN DE RANGO DE FECHAS (Cross-field) ---
  dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const inicio = group.get('fecha_inicio')?.value;
    const termino = group.get('fecha_termino')?.value;

    if (inicio && termino) {
      const dateInicio = new Date(inicio);
      const dateTermino = new Date(termino);

      if (dateInicio > dateTermino) {
        return { dateRangeInvalid: true };
      }
    }
    return null;
  }

  get integrantes(): FormArray {
    return this.memoriaForm.get('integrantes') as FormArray;
  }
  
  // ... (onEscuelaChange, rutValidator, onRutInput se mantienen igual) ...
  onEscuelaChange(event: any) {
    const escuela = event.detail.value as keyof typeof SCHOOLS_DATA;
    if (SCHOOLS_DATA[escuela]) {
      this.carrerasDisponibles = SCHOOLS_DATA[escuela];
    } else {
      this.carrerasDisponibles = [];
    }
    this.memoriaForm.patchValue({ carrera: '' });
  }

  rutValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const cleanValue = value.replace(/\./g, '').replace(/-/g, '');
    const cuerpo = cleanValue.slice(0, -1);
    
    const numCuerpo = parseInt(cuerpo, 10);
    if (isNaN(numCuerpo) || numCuerpo < 10000000 || numCuerpo > 30000000) {
      return { rutRange: true };
    }

    const rutPattern = /^\d{1,2}\.\d{3}\.\d{3}-[0-9kK]$|^\d{7,8}-[0-9kK]$/;
    if (!rutPattern.test(value)) {
      return { rutFormat: true };
    }

    return null;
  }

  onRutInput(event: any, index: number) {
    let value = event.target.value;
    value = value.replace(/[^0-9kK]/g, '');
    value = value.toUpperCase();

    if (value.length > 1) {
      const cuerpo = value.slice(0, -1);
      const dv = value.slice(-1);
      
      let formattedCuerpo = '';
      for (let i = cuerpo.length - 1, j = 0; i >= 0; i--, j++) {
        if (j > 0 && j % 3 === 0) {
          formattedCuerpo = '.' + formattedCuerpo;
        }
        formattedCuerpo = cuerpo[i] + formattedCuerpo;
      }
      
      value = `${formattedCuerpo}-${dv}`;
    }

    const control = this.integrantes.at(index).get('rut_estudiante');
    if (control) {
      control.setValue(value, { emitEvent: false });
      control.updateValueAndValidity();
    }
  }

  agregarIntegrante() {
    if (this.integrantes.length >= 10) {
      this.presentToast('Máximo 10 integrantes permitidos.', 'warning');
      return;
    }
    
    // Patrón simple para LinkedIn (permite http, https, www., linkedin.com/in/...)
    const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/.*$/;

    const integranteForm = this.fb.group({
      rut_estudiante: ['', [Validators.required, this.rutValidator]],
      nombre_estudiante: ['', [Validators.required, Validators.maxLength(30)]],
      apellido_estudiante: ['', [Validators.required, Validators.maxLength(30)]],
      segundo_nombre_estudiante: ['', Validators.maxLength(30)],
      segundo_apellido_estudiante: ['', Validators.maxLength(30)],
      linkedin: ['', [Validators.maxLength(200), Validators.pattern(linkedinPattern)]] 
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
    // Validar errores globales del grupo (Fechas)
    if (this.memoriaForm.hasError('dateRangeInvalid')) {
      this.presentToast('La fecha de inicio debe ser anterior a la fecha de término.', 'danger');
      return;
    }

    if (this.memoriaForm.invalid) {
      this.memoriaForm.markAllAsTouched();
      
      // Verificar si hay errores específicos de LinkedIn
      const invalidLinkedin = this.integrantes.controls.some(c => c.get('linkedin')?.hasError('pattern'));
      if (invalidLinkedin) {
        this.presentToast('Verifique que los enlaces de LinkedIn sean válidos (https://www.linkedin.com/in/...).', 'warning');
        return;
      }

      this.presentToast('Por favor complete los campos obligatorios correctamente.', 'danger');
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

  // ... (confirmarCancelar, guardarMemoria, presentToast se mantienen igual) ...
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