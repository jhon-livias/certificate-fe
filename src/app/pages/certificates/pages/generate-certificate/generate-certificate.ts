import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import * as docx from 'docx-preview';
import { StudentService } from '../../../students/services/student.service';
import { TemplateService } from '../../../templates/services/template.service';
import { CertificateService } from '../../services/certificate.service';

@Component({
  selector: 'app-generate-certificate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generate-certificate.html',
})
export class GenerateCertificate implements OnInit {
  private studentService = inject(StudentService);
  private templateService = inject(TemplateService);
  private certificateService = inject(CertificateService);

  @ViewChild('docxContainer', { static: false }) docxContainer!: ElementRef;

  // Estados Generales
  step = signal<number>(1);
  templates = toSignal(this.templateService.getList(), { initialValue: [] });

  // Paso 1: Búsqueda y Selección
  searchCode = signal<string>('');
  selectedStudent = signal<any | null>(null);
  selectedTemplateId = signal<number | null>(null);
  customCertificateCode = signal<string>(''); // Para que el admin edite el correlativo

  // Estados de Carga
  isSearching = signal<boolean>(false);
  isGenerating = signal<boolean>(false);
  previewReady = signal<boolean>(false);

  // Paso 2: Envío (Emails)
  ccEmails = signal<string[]>([]);
  issuedCertificateId = signal<number | null>(null); // Añade esto arriba
  isSendingEmail = signal<boolean>(false);
  emailBody = signal<string>(''); // Para enlazar el textarea

  ngOnInit() {
    this.templateService.callGetList().subscribe();
  }

  // Auto-completar el código sugerido cuando selecciona una plantilla
  onTemplateChange(templateId: number) {
    this.selectedTemplateId.set(templateId);
    const template = this.templates().find((t) => t.id == templateId);
    if (template) {
      this.customCertificateCode.set(template.code); // Ej: CPM Nº 00001 - 2026 R.A./UPRIT - PG
    }
  }

  // Buscar estudiante por código (Conectado a tu API)
  searchStudent() {
    const code = this.searchCode();
    if (code.length < 5) return; // Evitar búsquedas muy cortas

    this.isSearching.set(true);
    // Asume que tienes este método en tu StudentService
    this.studentService.getOne(code).subscribe({
      next: (student) => {
        this.selectedStudent.set(student);
        this.isSearching.set(false);
      },
      error: () => {
        this.selectedStudent.set(null);
        this.isSearching.set(false);
        alert('Estudiante no encontrado en la base de datos.');
      },
    });
  }

  // La Magia: Generar y pintar el Word
  generatePreview() {
    const student = this.selectedStudent();
    const templateId = this.selectedTemplateId();
    const certCode = this.customCertificateCode();

    if (!student || !templateId || !certCode) {
      alert('Por favor complete todos los campos de la izquierda.');
      return;
    }

    this.isGenerating.set(true);
    this.previewReady.set(false);

    const payload = {
      student_code: student.studentCode,
      certificate_id: templateId,
      certificate_code: certCode,
    };

    // 1. Mandamos a generar a Laravel
    this.certificateService.generateCertificate(payload).subscribe({
      next: (res) => {
        const issuedId = res.data.id;
        this.issuedCertificateId.set(issuedId);

        // 2. Descargamos el Blob generado para pintarlo
        this.certificateService.downloadGenerated(issuedId).subscribe({
          next: (blob) => {
            this.isGenerating.set(false);
            this.previewReady.set(true);

            setTimeout(() => {
              if (this.docxContainer) {
                docx
                  .renderAsync(blob, this.docxContainer.nativeElement, undefined, {
                    className: 'docx-preview-container',
                    inWrapper: true,
                  })
                  .catch((err) => console.error('Error renderizando', err));
              }
            }, 100);
          },
          error: () => this.isGenerating.set(false),
        });
      },
      error: (err) => {
        console.error(err);
        alert('Error al generar la constancia. Revisa la consola.');
        this.isGenerating.set(false);
      },
    });
  }

  // Utilidades para el Paso 2
  addCcEmail() {
    this.ccEmails.update((emails) => [...emails, '']);
  }

  removeCcEmail(index: number) {
    this.ccEmails.update((emails) => emails.filter((_, i) => i !== index));
  }

  updateCcEmail(index: number, event: any) {
    const value = event.target.value;
    this.ccEmails.update((emails) => {
      const newEmails = [...emails];
      newEmails[index] = value;
      return newEmails;
    });
  }

  sendOfficialEmail() {
    const id = this.issuedCertificateId();
    const student = this.selectedStudent();

    if (!id || !student) return;

    this.isSendingEmail.set(true);

    const payload = {
      email: student.email || 'estudiante@correo.com', // Ajusta según tu base de datos
      cc_emails: this.ccEmails().filter((e) => e.trim() !== ''), // Limpiar vacíos
      body:
        this.emailBody() || `Estimado(a) ${student.fullName}, adjunto encontrará su constancia...`,
    };

    this.certificateService.sendEmail(id, payload).subscribe({
      next: (res) => {
        this.isSendingEmail.set(false);
        alert('¡Constancia enviada exitosamente al correo del estudiante!');

        // Resetear todo para la siguiente constancia
        this.step.set(1);
        this.searchCode.set('');
        this.selectedStudent.set(null);
        this.previewReady.set(false);
        this.ccEmails.set([]);
      },
      error: (err) => {
        console.error(err);
        alert('Error al enviar el correo. Revisa la configuración del servidor SMTP.');
        this.isSendingEmail.set(false);
      },
    });
  }
}
