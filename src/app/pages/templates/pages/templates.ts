import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // <-- NUEVO
import { Template, TemplateService } from '../services/template.service';

@Component({
  selector: 'app-templates',
  imports: [CommonModule, FormsModule],
  templateUrl: './templates.html',
  styleUrl: './templates.css',
})
export class Templates {
  private templateService = inject(TemplateService);
  private sanitizer = inject(DomSanitizer); // <-- INYECTAMOS EL SANITIZADOR

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

  // --- NUEVOS ESTADOS PARA PDF ---
  pdfPreviewUrl = signal<SafeResourceUrl | null>(null);
  private rawPdfUrl: string | null = null; // Guardamos la url cruda para limpiar la memoria

  ngOnInit() {
    this.loadTemplates();
  }

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
    this.selectedFile.set(null); 
    this.message.set(null);
    this.showUploadForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      // VALIDAMOS QUE AHORA SEA PDF
      if (ext === 'pdf') {
        this.selectedFile.set(file);
      } else {
        alert('Solo se permiten archivos PDF (.pdf)');
        event.target.value = '';
      }
    }
  }

  upload() {
    const name = this.newTemplateName();
    const code = this.newTemplateCode();
    const file = this.selectedFile();
    const editingId = this.editingTemplateId();

    if (!name || !code || (!file && !editingId)) return;

    this.isUploading.set(true);

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
    if (confirm('¿Estás seguro de eliminar esta plantilla?')) {
      this.templateService.deleteTemplate(id).subscribe({
        next: () => this.templateService.callGetList().subscribe(),
        error: (err) => alert('No se pudo eliminar la plantilla. Revisa la consola.'),
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

  // --- LÓGICA DE PREVISUALIZACIÓN DE PDF ---
  previewTemplate(template: any) {
    this.showPreviewModal.set(true);
    this.previewTemplateName.set(template.name);
    this.isLoadingPreview.set(true);
    this.pdfPreviewUrl.set(null);

    this.templateService.downloadTemplate(template.id).subscribe({
      next: (blob: Blob) => {
        // 1. Aseguramos que el Blob tenga el mimetype correcto
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        
        // 2. Creamos una URL temporal en el navegador
        this.rawPdfUrl = window.URL.createObjectURL(pdfBlob);
        
        // 3. Sanitizamos la URL para que Angular permita meterla en el src del iframe
        const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawPdfUrl);
        
        this.pdfPreviewUrl.set(safeUrl);
        this.isLoadingPreview.set(false);
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
    this.pdfPreviewUrl.set(null);
    
    // Limpiamos la memoria del navegador destruyendo la URL del PDF temporal
    if (this.rawPdfUrl) {
      window.URL.revokeObjectURL(this.rawPdfUrl);
      this.rawPdfUrl = null;
    }
  }
}