import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // <-- IMPORTANTE
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: 'app-preview-certificate',
  imports: [CommonModule, FormsModule],
  templateUrl: './preview-certificate.html',
  styleUrl: './preview-certificate.css',
})
export class PreviewCertificate {
  private route = inject(ActivatedRoute);
  private validationService = inject(ValidationService);
  private sanitizer = inject(DomSanitizer); // <-- INYECTAMOS EL SANITIZADOR

  // Capturamos el código de la URL
  trackingCode = signal<string>('');

  // Inputs del usuario
  dni = signal<string>('');
  certificateCode = signal<string>('');

  // Estados de UI
  isChecking = signal<boolean>(false);
  isValidated = signal<boolean>(false);
  errorMessage = signal<string>('');
  certData = signal<any>(null);

  // Previsualización PDF
  showPreview = signal<boolean>(false);
  isLoadingDoc = signal<boolean>(false);
  pdfPreviewUrl = signal<SafeResourceUrl | null>(null);
  private rawPdfUrl: string | null = null; // Para limpiar memoria

  ngOnInit() {
    this.trackingCode.set(this.route.snapshot.paramMap.get('trackingCode') || '');
  }

  verify() {
    if (!this.dni() || !this.certificateCode()) return;

    this.isChecking.set(true);
    this.errorMessage.set('');

    this.validationService
      .validateCredentials({
        tracking_code: this.trackingCode(),
        dni: this.dni(),
        certificate_code: this.certificateCode(),
      })
      .subscribe({
        next: (res) => {
          this.isChecking.set(false);
          this.isValidated.set(true);
          this.certData.set(res.data);
        },
        error: (err) => {
          this.isChecking.set(false);
          this.errorMessage.set(err.error?.message || 'Error de conexión.');
        },
      });
  }

  loadPreview() {
    this.showPreview.set(true);
    this.isLoadingDoc.set(true);
    this.pdfPreviewUrl.set(null);

    this.validationService
      .getValidatedBlob(this.trackingCode(), this.dni(), this.certificateCode())
      .subscribe({
        next: (blob) => {
          // Limpiamos URL anterior si existe
          if (this.rawPdfUrl) window.URL.revokeObjectURL(this.rawPdfUrl);

          // Forzamos el tipo a PDF y creamos la URL segura
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          this.rawPdfUrl = window.URL.createObjectURL(pdfBlob);
          this.pdfPreviewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.rawPdfUrl));
          
          this.isLoadingDoc.set(false);
        },
        error: () => {
          this.isLoadingDoc.set(false);
          alert('Error al cargar el documento PDF.');
          this.showPreview.set(false);
        },
      });
  }

  closePreview() {
    this.showPreview.set(false);
    this.pdfPreviewUrl.set(null);
    if (this.rawPdfUrl) {
      window.URL.revokeObjectURL(this.rawPdfUrl);
      this.rawPdfUrl = null;
    }
  }

  downloadDocument() {
    this.validationService
      .getValidatedBlob(this.trackingCode(), this.dni(), this.certificateCode())
      .subscribe((blob) => {
        // Aseguramos que se descargue como PDF
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.certificateCode()}.pdf`; // <-- ACÁ ESTABA EL VILLANO
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}