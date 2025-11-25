import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup,
  Validators, ReactiveFormsModule, FormsModule 
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // RouterModule útil para routerLink
import { AlertController, ToastController, IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/service/http-client';
import { SCHOOLS_DATA,
  getSchoolCode, getCareerCode,
  getCareerName, getSchoolName
} from 'src/app/constants/school-data';
import { addIcons } from 'ionicons';
import { refreshOutline, addCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-editar-memoria',
  templateUrl: './editar-memoria.page.html',
  styleUrls: ['./editar-memoria.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    RouterModule
  ]
})
export class EditarMemoriaPage implements OnInit {
  memoryId: number | null = null;
  isLoading = true;
  memoriaForm: FormGroup;
  // Casteamos las keys para evitar error de tipado en el *ngFor
  escuelas = Object.keys(SCHOOLS_DATA) as Array<keyof typeof SCHOOLS_DATA>;
  carrerasDisponibles: string[] = [];

  pdfFile: File | null = null;
  imgFile: File | null = null;
  currentPdfName: string = '';
  currentImgName: string = '';

  detallesExistentes: any[] = [];
  nuevoIntegranteForm: FormGroup;
  mostrarFormNuevo = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    addIcons({ refreshOutline, addCircleOutline });

    this.memoriaForm = this.fb.group({
      titulo: ['', Validators.required],
      profesor: ['', Validators.required],
      descripcion: ['', Validators.required],
      escuela: ['', Validators.required],
      carrera: ['', Validators.required],
      entidad_involucrada: ['', Validators.required],
      tipo_entidad: ['', Validators.required],
      tipo_memoria: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_termino: ['', Validators.required],
    });

    this.nuevoIntegranteForm = this.createIntegranteForm();
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      
      if (id) {
        this.memoryId = +id; // Convertir string a number
        this.loadData();
      } else {
        // Si no hay ID en la URL, devolvemos a proyectos
        this.router.navigate(['/proyectos']);
      }
    });
  }

  createIntegranteForm(data?: any): FormGroup {
    return this.fb.group({
      rut_estudiante: [data?.rut_estudiante || '', [Validators.required, Validators.pattern(/^\d{1,2}\.\d{3}\.\d{3}-[0-9kK]$|^\d{7,8}-[0-9kK]$/)]],
      nombre_estudiante: [data?.nombre_estudiante || '', Validators.required],
      apellido_estudiante: [data?.apellido_estudiante || '', Validators.required],
      segundo_nombre_estudiante: [data?.segundo_nombre_estudiante || ''],
      segundo_apellido_estudiante: [data?.segundo_apellido_estudiante || ''],
      linkedin: [data?.linkedin || '']
    });
  }

  loadData() {
    this.isLoading = true;
    if (!this.memoryId) return;

    this.api.getMemoryById(this.memoryId).subscribe({
      next: (memo) => {
        // Importante: patchValue puede fallar si mandas campos extra, pero suele ignorarlos.
        // Asegúrate que los nombres coincidan con el form.
        this.memoriaForm.patchValue(memo);
        
        this.currentPdfName = memo.loc_disco ? 'Archivo actual guardado' : '';
        this.currentImgName = memo.imagen_display ? 'Imagen actual guardada' : '';
        // --- TRADUCCIÓN AL RECIBIR (Backend -> Frontend) ---
        const dataToPatch = { ...memo };
        // Cargar carreras y evitar error de índice
        if (memo.escuela) {
          dataToPatch.escuela = getSchoolName(memo.escuela);
          const escuelaKey = dataToPatch.escuela as keyof typeof SCHOOLS_DATA;
          this.carrerasDisponibles = SCHOOLS_DATA[escuelaKey] || [];
        }
        
        if (memo.carrera) {
          dataToPatch.carrera = getCareerName(memo.carrera);
        }

        this.memoriaForm.patchValue(dataToPatch);
        
        this.currentPdfName = memo.loc_disco ? 'Archivo actual guardado' : '';
        this.currentImgName = memo.imagen_display ? 'Imagen actual guardada' : '';

        this.loadDetails();
      },
      error: () => {
        this.isLoading = false;
        this.presentToast('Error al cargar la memoria', 'danger');
      }
    });
  }

  loadDetails() {
    if (!this.memoryId) return;
    this.api.getMemoryDetails(this.memoryId).subscribe({
      next: (res) => {
        this.detallesExistentes = res.detalles.map((d: any) => ({
          ...d,
          form: this.createIntegranteForm(d)
        }));
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onEscuelaChange(event: any) {
    // Corrección de tipado aquí también
    const escuela = event.detail.value as keyof typeof SCHOOLS_DATA;
    this.carrerasDisponibles = SCHOOLS_DATA[escuela] || [];
  }

  onFileSelected(event: any, type: 'pdf' | 'img') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'pdf') {
        this.pdfFile = file;
        this.currentPdfName = file.name;
      } else {
        this.imgFile = file;
        this.currentImgName = file.name;
      }
    }
  }

  // --- Lógica Principal (Memoria) ---
  async confirmarActualizarMemoria() {
    const alert = await this.alertCtrl.create({
      header: 'Actualizar Memoria',
      message: '¿Confirmar cambios en la información principal del proyecto?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Actualizar', handler: () => this.actualizarMemoria() }
      ]
    });
    await alert.present();
  }

  actualizarMemoria() {
    if (!this.memoryId) return;
    const formData = new FormData();
    const formValue = this.memoriaForm.value;

    Object.keys(formValue).forEach(key => {
      let value = formValue[key];

      // --- TRADUCCIÓN AL ENVIAR (Frontend -> Backend) ---
      if (key === 'escuela') {
        value = getSchoolCode(value);
      }
      if (key === 'carrera') {
        value = getCareerCode(value);
      }

      formData.append(key, value);
    });

    if (this.pdfFile) formData.append('loc_disco', this.pdfFile);
    if (this.imgFile) formData.append('imagen_display', this.imgFile);

    this.api.updateMemory(this.memoryId, formData).subscribe({
      next: () => this.presentToast('Memoria actualizada correctamente', 'success'),
      error: () => this.presentToast('Error al actualizar', 'danger')
    });
  }

  async confirmarEliminarMemoria() {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Proyecto',
      message: 'Esta acción eliminará el proyecto y todos sus integrantes. ¿Continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.eliminarMemoria() }
      ]
    });
    await alert.present();
  }

  eliminarMemoria() {
    if (!this.memoryId) return;
    this.api.deleteMemory(this.memoryId).subscribe({
      next: () => {
        this.presentToast('Proyecto eliminado', 'success');
        this.router.navigate(['/proyectos']);
      },
      error: () => this.presentToast('Error al eliminar proyecto', 'danger')
    });
  }

  // --- Lógica Detalles (Integrantes) ---
  
  async confirmarAgregarDetalle() {
    if (this.nuevoIntegranteForm.invalid) {
      this.presentToast('Complete los datos del integrante', 'warning');
      return;
    }
    const alert = await this.alertCtrl.create({
      header: 'Agregar Integrante',
      message: '¿Agregar este nuevo integrante al proyecto?',
      buttons: ['Cancelar', { text: 'Agregar', handler: () => this.agregarDetalle() }]
    });
    await alert.present();
  }

  agregarDetalle() {
    if (!this.memoryId) return;
    this.api.addMemoryDetail(this.memoryId, this.nuevoIntegranteForm.value).subscribe({
      next: () => {
        this.presentToast('Integrante agregado', 'success');
        this.nuevoIntegranteForm.reset();
        this.mostrarFormNuevo = false;
        this.loadDetails(); 
      },
      error: () => this.presentToast('Error al agregar integrante', 'danger')
    });
  }

  async confirmarUpdateDetalle(detalle: any) {
    if (detalle.form.invalid) return;
    
    const alert = await this.alertCtrl.create({
      header: 'Actualizar Integrante',
      message: `¿Guardar cambios para ${detalle.nombre_estudiante}?`,
      buttons: ['Cancelar', { text: 'Guardar', handler: () => this.updateDetalle(detalle) }]
    });
    await alert.present();
  }

  updateDetalle(detalle: any) {
    if (!this.memoryId) return;
    this.api.updateMemoryDetail(this.memoryId, detalle.id_detalle, detalle.form.value).subscribe({
      next: () => this.presentToast('Datos del integrante actualizados', 'success'),
      error: () => this.presentToast('Error al actualizar integrante', 'danger')
    });
  }

  async confirmarDeleteDetalle(idDetalle: number) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Integrante',
      message: '¿Quitar este integrante del proyecto?',
      buttons: ['Cancelar', { text: 'Eliminar', role: 'destructive', handler: () => this.deleteDetalle(idDetalle) }]
    });
    await alert.present();
  }

  deleteDetalle(idDetalle: number) {
    if (!this.memoryId) return;
    this.api.deleteMemoryDetail(this.memoryId, idDetalle).subscribe({
      next: () => {
        this.presentToast('Integrante eliminado', 'success');
        this.loadDetails();
      },
      error: () => this.presentToast('Error al eliminar integrante', 'danger')
    });
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message, duration: 3000, color, position: 'bottom'
    });
    toast.present();
  }
}