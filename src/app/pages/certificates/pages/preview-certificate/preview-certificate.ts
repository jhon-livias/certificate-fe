import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: 'app-preview-certificate',
  imports: [CommonModule, FormsModule],
  templateUrl: './preview-certificate.html',
  styleUrl: './preview-certificate.css',
})
export class PreviewCertificate implements OnDestroy {
  private route = inject(ActivatedRoute);
  private validationService = inject(ValidationService);
  private sanitizer = inject(DomSanitizer);

  trackingCode = signal<string>('');
  dni = signal<string>('');
  certificateCode = signal<string>('');

  isChecking = signal<boolean>(false);
  isValidated = signal<boolean>(false);
  errorMessage = signal<string>('');
  certData = signal<any>(null);

  showPreview = signal<boolean>(false);
  isLoadingDoc = signal<boolean>(false);
  pdfPreviewUrl = signal<SafeResourceUrl | null>(null);

  private rawPdfUrl: string | null = null;

  ngOnInit() {
    this.trackingCode.set(this.route.snapshot.paramMap.get('trackingCode') || '');
  }

  ngOnDestroy() {
    this.revokePdfPreviewUrl();
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
    this.revokePdfPreviewUrl();

    this.validationService
      .getValidatedBlob(this.trackingCode(), this.dni(), this.certificateCode())
      .subscribe({
        next: (blob) => {
          this.isLoadingDoc.set(false);
          this.rawPdfUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
          this.pdfPreviewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.rawPdfUrl));
        },
        error: () => {
          this.isLoadingDoc.set(false);
          alert('Error al cargar el PDF.');
        },
      });
  }

  closePreview() {
    this.showPreview.set(false);
    this.revokePdfPreviewUrl();
  }

  downloadDocument() {
    this.validationService
      .getValidatedBlob(this.trackingCode(), this.dni(), this.certificateCode())
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.certificateCode().replace(/[/\\]/g, '-')}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  private revokePdfPreviewUrl() {
    if (this.rawPdfUrl) {
      URL.revokeObjectURL(this.rawPdfUrl);
      this.rawPdfUrl = null;
    }
    this.pdfPreviewUrl.set(null);
  }
}
