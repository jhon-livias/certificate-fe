import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // <-- NUEVO IMPORT
import { ToastService } from '../../../../services/toast.service';
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
  private sanitizer = inject(DomSanitizer); // <-- INYECTAMOS SANITIZADOR
  private toast = inject(ToastService);

  // Estados Generales
  step = signal<number>(1);
  templates = toSignal(this.templateService.getList(), { initialValue: [] });

  // Paso 1: Búsqueda y Selección
  searchCode = signal<string>('');
  selectedStudent = signal<any | null>(null);
  selectedTemplateId = signal<number | null>(null);
  customCertificateCode = signal<string>('');

  // Estados de Carga
  isSearching = signal<boolean>(false);
  isGenerating = signal<boolean>(false);
  previewReady = signal<boolean>(false);

  // Visor PDF
  pdfPreviewUrl = signal<SafeResourceUrl | null>(null);
  private rawPdfUrl: string | null = null;

  // Paso 2: Envío (Emails)
  ccEmails = signal<string[]>([]);
  issuedCertificateId = signal<number | null>(null);
  isSendingEmail = signal<boolean>(false);
  customEmail = signal<string>('');
  emailBody = signal<string>('');

  ngOnInit() {
    this.templateService.callGetList().subscribe();
  }

  onTemplateChange(templateId: number) {
    this.selectedTemplateId.set(templateId);
    const template = this.templates().find((t) => t.id == templateId);
    if (template) {
      this.customCertificateCode.set(template.code);
    }
  }

  searchStudent() {
    const code = this.searchCode();
    if (code.length < 5) return;

    this.isSearching.set(true);
    this.studentService.getOne(code).subscribe({
      next: (student) => {
        this.selectedStudent.set(student);
        this.customEmail.set(student.email || '');
        this.isSearching.set(false);
      },
      error: () => {
        this.selectedStudent.set(null);
        this.isSearching.set(false);
        this.toast.show('Estudiante no encontrado en la base de datos.', 'error');
      },
    });
  }

  generatePreview() {
    const student = this.selectedStudent();
    const templateId = this.selectedTemplateId();
    const certCode = this.customCertificateCode();

    if (!student || !templateId || !certCode) {
      this.toast.show('Por favor complete todos los campos de la izquierda.', 'error');
      return;
    }

    this.isGenerating.set(true);
    this.previewReady.set(false);
    this.pdfPreviewUrl.set(null);

    const payload = {
      dni: student.document_number || student.dni, // Asegura que coincida con tu BD
      certificate_id: templateId,
      certificate_code: certCode,
    };

    this.certificateService.generateCertificate(payload).subscribe({
      next: (res) => {
        const issuedId = res.data.id;
        this.issuedCertificateId.set(issuedId);

        this.certificateService.downloadGenerated(issuedId).subscribe({
          next: (blob) => {
            // Limpiamos URL anterior si existe para no saturar memoria
            if (this.rawPdfUrl) window.URL.revokeObjectURL(this.rawPdfUrl);

            // Convertimos la respuesta a PDF y generamos URL segura
            const pdfBlob = new Blob([blob], { type: 'application/pdf' });
            this.rawPdfUrl = window.URL.createObjectURL(pdfBlob);
            this.pdfPreviewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.rawPdfUrl));

            this.isGenerating.set(false);
            this.previewReady.set(true);
          },
          error: () => this.isGenerating.set(false),
        });
      },
      error: (err) => {
        console.error(err);
        this.isGenerating.set(false);
        this.toast.show('Error al generar la constancia.', 'error');
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
      email: this.customEmail() || 'estudiante@correo.com',
      cc_emails: this.ccEmails().filter((e) => e.trim() !== ''),
      body: this.emailBody() || `Estimado(a) ${student.fullName || student.name}, adjunto encontrará su constancia...`,
    };

    this.certificateService.sendEmail(id, payload).subscribe({
      next: (res) => {
        this.isSendingEmail.set(false);
        this.toast.show('¡Constancia enviada exitosamente al correo!', 'success');

        // Resetear todo
        this.step.set(1);
        this.searchCode.set('');
        this.selectedStudent.set(null);
        this.previewReady.set(false);
        this.pdfPreviewUrl.set(null);
        if (this.rawPdfUrl) window.URL.revokeObjectURL(this.rawPdfUrl);
        this.ccEmails.set([]);
      },
      error: (err) => {
        console.error(err);
        this.isSendingEmail.set(false);
        this.toast.show('Error al enviar el correo.', 'error');
      },
    });
  }
}