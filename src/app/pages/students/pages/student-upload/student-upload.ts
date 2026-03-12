import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student-upload',
  imports: [CommonModule],
  templateUrl: './student-upload.html',
  styleUrl: './student-upload.css',
})
export class StudentUpload {
  private studentService = inject(StudentService);

  // Estados reactivos
  selectedFile = signal<File | null>(null);
  isDragging = signal<boolean>(false);
  isUploading = signal<boolean>(false);
  message = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  // Eventos de Drag & Drop
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  // Evento de clic tradicional
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
    // Reseteamos el input para poder subir el mismo archivo si hubo error
    event.target.value = '';
  }

  // Validación rápida
  handleFile(file: File) {
    const validExtensions = ['xlsx', 'csv'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension && validExtensions.includes(fileExtension)) {
      this.selectedFile.set(file);
      this.message.set(null);
    } else {
      this.message.set({ text: 'Por favor, sube un archivo Excel (.xlsx) o CSV.', type: 'error' });
    }
  }

  removeFile() {
    this.selectedFile.set(null);
    this.message.set(null);
  }

  // Enviar al Backend
  upload() {
    const file = this.selectedFile();
    if (!file) return;

    this.isUploading.set(true);
    this.message.set(null);

    this.studentService.uploadBulk(file).subscribe({
      next: (res: any) => {
        this.isUploading.set(false);
        this.selectedFile.set(null);
        // Mostramos el mensaje 202 que viene de Laravel
        this.message.set({
          text: res.message || 'Carga iniciada correctamente en segundo plano.',
          type: 'success',
        });

        // ¡Magia! Actualizamos el BehaviorSubject silenciosamente para que la tabla del Menú 1 se refresque sola
        this.studentService.callGetList().subscribe();
      },
      error: (err) => {
        this.isUploading.set(false);
        this.message.set({
          text: 'Ocurrió un error al procesar el archivo. Revisa la consola.',
          type: 'error',
        });
        console.error(err);
      },
    });
  }
}
