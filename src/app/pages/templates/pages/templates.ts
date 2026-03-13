import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import * as docx from 'docx-preview';
import { Template, TemplateService } from '../services/template.service';

@Component({
  selector: 'app-templates',
  imports: [CommonModule, FormsModule],
  templateUrl: './templates.html',
  styleUrl: './templates.css',
})
export class Templates {
  @ViewChild('docxContainer', { static: false }) docxContainer!: ElementRef;

  private templateService = inject(TemplateService);

  // Estados
  templates = toSignal(this.templateService.getList(), { initialValue: [] });
  editingTemplateId = signal<number | null>(null);

  showUploadForm = signal<boolean>(false);
  isUploading = signal<boolean>(false);
  isLoadingData = signal<boolean>(false);

  newTemplateName = signal<string>('');
  newTemplateCode = signal<string>('');
  selectedFile = signal<File | null>(null);
  message = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  showPreviewModal = signal<boolean>(false);
  previewTemplateName = signal<string>('');
  isLoadingPreview = signal<boolean>(false);

  ngOnInit() {
    this.loadTemplates();
  }

  // Cargar desde la API
  loadTemplates() {
    this.isLoadingData.set(true);
    this.templateService.callGetList().subscribe({
      next: () => this.isLoadingData.set(false),
      error: (err) => {
        console.error('Error cargando plantillas:', err);
        this.isLoadingData.set(false);
      },
    });
  }

  toggleUploadForm() {
    this.showUploadForm.update((v) => !v);
    this.resetForm();
  }

  editTemplate(template: Template) {
    this.editingTemplateId.set(template.id);
    this.newTemplateName.set(template.name);
    this.newTemplateCode.set(template.code);
    this.selectedFile.set(null); // Empezamos sin archivo nuevo seleccionado
    this.message.set(null);
    this.showUploadForm.set(true);

    // Hacemos scroll suave hacia arriba para que el usuario vea el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'docx') {
        this.selectedFile.set(file);
      } else {
        alert('Solo se permiten archivos Word (.docx)');
        event.target.value = '';
      }
    }
  }

  upload() {
    const name = this.newTemplateName();
    const code = this.newTemplateCode();
    const file = this.selectedFile();
    const editingId = this.editingTemplateId();

    // Si estamos CREANDO, el archivo es obligatorio. Si estamos EDITANDO, es opcional.
    if (!name || !code || (!file && !editingId)) return;

    this.isUploading.set(true);

    // Decidimos qué método del servicio llamar
    const request$ = editingId
      ? this.templateService.updateTemplate(editingId, name, code, file)
      : this.templateService.uploadTemplate(name, code, file as File);

    request$.subscribe({
      next: (res) => {
        this.isUploading.set(false);
        this.message.set({ text: res.message, type: 'success' });

        this.templateService.callGetList().subscribe();

        setTimeout(() => this.toggleUploadForm(), 1500);
      },
      error: (err) => {
        this.isUploading.set(false);
        this.message.set({ text: 'Error al procesar la plantilla', type: 'error' });
      },
    });
  }

  deleteTemplate(id: number) {
    if (confirm('¿Estás seguro de eliminar esta plantilla de la base de datos y del servidor?')) {
      this.templateService.deleteTemplate(id).subscribe({
        next: () => {
          // Volvemos a pedir la lista actualizada
          this.templateService.callGetList().subscribe();
        },
        error: (err) => {
          alert('No se pudo eliminar la plantilla. Revisa la consola.');
          console.error(err);
        },
      });
    }
  }

  resetForm() {
    this.editingTemplateId.set(null);
    this.newTemplateName.set('');
    this.newTemplateCode.set('');
    this.selectedFile.set(null);
    this.message.set(null);
  }

  previewTemplate(template: any) {
    // Cambia 'any' por tu interfaz Template/Certificate
    this.showPreviewModal.set(true);
    this.previewTemplateName.set(template.name);
    this.isLoadingPreview.set(true);

    this.templateService.downloadTemplate(template.id).subscribe({
      next: (blob: Blob) => {
        this.isLoadingPreview.set(false);

        // Le damos un respiro a Angular para que pinte el modal en el HTML antes de inyectar el Word
        setTimeout(() => {
          if (this.docxContainer) {
            // Opciones para que se vea limpio
            const options = {
              className: 'docx-preview-container',
              inWrapper: true,
              ignoreWidth: false,
              ignoreHeight: false,
            };

            // Renderizamos el Blob (el archivo Word) dentro del div
            docx
              .renderAsync(blob, this.docxContainer.nativeElement, undefined, options)
              .then(() => console.log('Documento renderizado con éxito'))
              .catch((err) => console.error('Error renderizando', err));
          }
        }, 100);
      },
      error: (err) => {
        this.isLoadingPreview.set(false);
        alert('Error al descargar el documento para la previsualización.');
        this.showPreviewModal.set(false);
      },
    });
  }

  closePreview() {
    this.showPreviewModal.set(false);
    if (this.docxContainer) {
      this.docxContainer.nativeElement.innerHTML = ''; // Limpiamos el contenedor
    }
  }
}
