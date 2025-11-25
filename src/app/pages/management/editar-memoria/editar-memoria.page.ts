import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertController, ToastController, IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/service/http-client';
import { SCHOOLS_DATA, getSchoolName, getCareerName, getSchoolCode, getCareerCode } from 'src/app/constants/schools-data';
import { addIcons } from 'ionicons';
import { refreshOutline, addCircleOutline, trashOutline, saveOutline, arrowBackOutline } from 'ionicons/icons';

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
  
  originalValues: any = {};

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
    addIcons({ refreshOutline, addCircleOutline, trashOutline, saveOutline, arrowBackOutline });

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
    }, { validators: this.dateRangeValidator }); // Validación fechas

    this.nuevoIntegranteForm = this.createIntegranteForm();
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.memoryId = +id;
        this.loadData();
      } else {
        this.router.navigate(['/proyectos']);
      }
    });
  }

  // --- VALIDACIÓN FECHAS ---
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

  // --- VALIDACIÓN RUT CUSTOM ---
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

  createIntegranteForm(data?: any): FormGroup {
    const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/.*$/;

    return this.fb.group({
      rut_estudiante: [data?.rut_estudiante || '', [Validators.required, this.rutValidator]],
      nombre_estudiante: [data?.nombre_estudiante || '', [Validators.required, Validators.maxLength(30)]],
      apellido_estudiante: [data?.apellido_estudiante || '', [Validators.required, Validators.maxLength(30)]],
      segundo_nombre_estudiante: [data?.segundo_nombre_estudiante || '', Validators.maxLength(30)],
      segundo_apellido_estudiante: [data?.segundo_apellido_estudiante || '', Validators.maxLength(30)],
      linkedin: [data?.linkedin || '', [Validators.maxLength(200), Validators.pattern(linkedinPattern)]]
    });
  }

  // ... (formatRutString, onRutInput..., loadData, loadDetails, onEscuelaChange, onFileSelected, actualizarMemoria... se mantienen igual)
  // --- FORMATEADOR RUT ---
  onRutInputExisting(event: any, detalle: any) {
    let value = event.target.value;
    value = this.formatRutString(value);
    
    const control = detalle.form.get('rut_estudiante');
    if (control) {
      control.setValue(value, { emitEvent: false });
      control.updateValueAndValidity();
    }
  }

  onRutInputNew(event: any) {
    let value = event.target.value;
    value = this.formatRutString(value);
    
    const control = this.nuevoIntegranteForm.get('rut_estudiante');
    if (control) {
      control.setValue(value, { emitEvent: false });
      control.updateValueAndValidity();
    }
  }

  formatRutString(value: string): string {
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
      
      return `${formattedCuerpo}-${dv}`;
    }
    return value;
  }

  loadData() {
    this.isLoading = true;
    if (!this.memoryId) return;

    this.api.getOnlyMemoryById(this.memoryId).subscribe({
      next: (memo) => {
        const dataToPatch = { ...memo };

        if (dataToPatch.fecha_inicio) dataToPatch.fecha_inicio = dataToPatch.fecha_inicio.split('T')[0];
        if (dataToPatch.fecha_termino) dataToPatch.fecha_termino = dataToPatch.fecha_termino.split('T')[0];

        if (memo.escuela) {
          dataToPatch.escuela = getSchoolName(memo.escuela);
          const escuelaKey = dataToPatch.escuela as keyof typeof SCHOOLS_DATA;
          this.carrerasDisponibles = SCHOOLS_DATA[escuelaKey] || [];
        }

        if (memo.carrera) {
          dataToPatch.carrera = getCareerName(memo.carrera);
        }

        this.memoriaForm.patchValue(dataToPatch);
        this.originalValues = { ...this.memoriaForm.value };
        
        this.currentPdfName = memo.loc_disco ? 'Archivo PDF guardado' : '';
        this.currentImgName = memo.imagen_display ? 'Imagen guardada' : '';
        
        this.loadDetails();
      },
      error: (err) => {
        this.isLoading = false;
        this.presentToast('Error al cargar la información del proyecto.', 'danger');
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
    const escuela = event.detail.value as keyof typeof SCHOOLS_DATA;
    this.carrerasDisponibles = SCHOOLS_DATA[escuela] || [];
    this.memoriaForm.patchValue({ carrera: '' });
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

  actualizarMemoria() {
    if (!this.memoryId) return;

    const currentValues = this.memoriaForm.value;
    const changedFields: any = {};
    let hasChanges = false;
    let totalFields = 0;
    let changedCount = 0;

    Object.keys(currentValues).forEach(key => {
      totalFields++;
      if (currentValues[key] !== this.originalValues[key]) {
        let valueToSend = currentValues[key];
        if (key === 'escuela') valueToSend = getSchoolCode(valueToSend);
        if (key === 'carrera') valueToSend = getCareerCode(valueToSend);
        changedFields[key] = valueToSend;
        hasChanges = true;
        changedCount++;
      }
    });

    const hasFiles = !!this.pdfFile || !!this.imgFile;

    if (!hasChanges && !hasFiles) {
      this.presentToast('No se han detectado cambios.', 'warning');
      return;
    }

    if (changedCount === totalFields) {
      const formData = new FormData();
      Object.keys(currentValues).forEach(key => {
        let val = currentValues[key];
        if (key === 'escuela') val = getSchoolCode(val);
        if (key === 'carrera') val = getCareerCode(val);
        formData.append(key, val);
      });
      if (this.pdfFile) formData.append('loc_disco', this.pdfFile);
      if (this.imgFile) formData.append('imagen_display', this.imgFile);

      this.api.updateMemoryPut(this.memoryId, formData).subscribe({
        next: () => this.handleSuccessUpdate(),
        error: () => this.presentToast('Error al actualizar (PUT)', 'danger')
      });
      return;
    }

    if (hasFiles) {
      const formData = new FormData();
      Object.keys(changedFields).forEach(key => {
        formData.append(key, changedFields[key]);
      });
      if (this.pdfFile) formData.append('loc_disco', this.pdfFile);
      if (this.imgFile) formData.append('imagen_display', this.imgFile);

      this.api.updateMemoryPatch(this.memoryId, formData).subscribe({
        next: () => this.handleSuccessUpdate(),
        error: () => this.presentToast('Error al actualizar (PATCH Multipart)', 'danger')
      });
      return;
    }

    this.api.updateMemoryPatch(this.memoryId, changedFields).subscribe({
      next: () => this.handleSuccessUpdate(),
      error: () => this.presentToast('Error al actualizar (PATCH JSON)', 'danger')
    });
  }

  handleSuccessUpdate() {
    this.presentToast('Proyecto actualizado correctamente', 'success');
    this.originalValues = { ...this.memoriaForm.value };
    this.pdfFile = null;
    this.imgFile = null;
  }

  async confirmarActualizarMemoria() {
    if (this.memoriaForm.invalid) {
      this.memoriaForm.markAllAsTouched();
      // Mostrar mensaje si las fechas son inválidas
      if (this.memoriaForm.hasError('dateRangeInvalid')) {
        this.presentToast('La fecha de inicio debe ser anterior a la fecha de término.', 'danger');
        return;
      }
      this.presentToast('Revise los campos del formulario principal.', 'warning');
      return;
    }
    const alert = await this.alertCtrl.create({
      header: 'Confirmar cambios',
      message: '¿Deseas actualizar la información principal del proyecto?',
      buttons: ['Cancelar', { text: 'Sí, actualizar', handler: () => this.actualizarMemoria() }]
    });
    await alert.present();
  }

  // ... (confirmarEliminarMemoria, eliminarMemoria... se mantienen igual)
  async confirmarEliminarMemoria() {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Proyecto',
      message: 'Esta acción es irreversible. ¿Eliminar proyecto y sus integrantes?',
      buttons: ['Cancelar', { text: 'Eliminar', role: 'destructive', handler: () => this.eliminarMemoria() }]
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
      error: () => this.presentToast('Error al eliminar', 'danger')
    });
  }

  async confirmarAgregarDetalle() {
    if (this.nuevoIntegranteForm.invalid) {
      const patternError = this.nuevoIntegranteForm.get('linkedin')?.hasError('pattern');
      if (patternError) {
        this.presentToast('El enlace de LinkedIn no es válido.', 'warning');
        return;
      }
      this.presentToast('Complete los campos obligatorios del integrante.', 'warning');
      return;
    }
    const alert = await this.alertCtrl.create({
      header: 'Agregar Integrante',
      message: '¿Añadir este nuevo integrante?',
      buttons: ['Cancelar', { text: 'Añadir', handler: () => this.agregarDetalle() }]
    });
    await alert.present();
  }

  agregarDetalle() {
    if (!this.memoryId) return;
    this.api.addMemoryDetail(this.memoryId, this.nuevoIntegranteForm.value).subscribe({
      next: () => {
        this.presentToast('Integrante añadido', 'success');
        this.nuevoIntegranteForm.reset();
        this.mostrarFormNuevo = false;
        this.loadDetails();
      },
      error: () => this.presentToast('Error al añadir integrante', 'danger')
    });
  }

  async confirmarUpdateDetalle(detalle: any) {
    if (detalle.form.invalid) {
      const patternError = detalle.form.get('linkedin')?.hasError('pattern');
      if (patternError) {
        this.presentToast('El enlace de LinkedIn no es válido.', 'warning');
        return;
      }
      this.presentToast('Revise los campos del integrante.', 'warning');
      return;
    }
    const alert = await this.alertCtrl.create({
      header: 'Actualizar Integrante',
      message: '¿Guardar cambios de este integrante?',
      buttons: ['Cancelar', { text: 'Guardar', handler: () => this.updateDetalle(detalle) }]
    });
    await alert.present();
  }

  // ... (updateDetalle, confirmarDeleteDetalle, deleteDetalle, presentToast se mantienen igual)
  updateDetalle(detalle: any) {
    if (!this.memoryId) return;
    this.api.updateMemoryDetail(this.memoryId, detalle.id_detalle, detalle.form.value).subscribe({
      next: () => this.presentToast('Integrante actualizado', 'success'),
      error: () => this.presentToast('Error al actualizar integrante', 'danger')
    });
  }

  async confirmarDeleteDetalle(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Integrante',
      message: '¿Quitar a este integrante del proyecto?',
      buttons: ['Cancelar', { text: 'Eliminar', role: 'destructive', handler: () => this.deleteDetalle(id) }]
    });
    await alert.present();
  }

  deleteDetalle(id: number) {
    if (!this.memoryId) return;
    this.api.deleteMemoryDetail(this.memoryId, id).subscribe({
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