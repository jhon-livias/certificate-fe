import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as docx from 'docx-preview';
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

  // Previsualización
  @ViewChild('docxContainer', { static: false }) docxContainer!: ElementRef;
  showPreview = signal<boolean>(false);
  isLoadingDoc = signal<boolean>(false);

  ngOnInit() {
    // Obtenemos el ID encriptado de la URL
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

    this.validationService
      .getValidatedBlob(this.trackingCode(), this.dni(), this.certificateCode())
      .subscribe({
        next: (blob) => {
          this.isLoadingDoc.set(false);
          setTimeout(() => {
            if (this.docxContainer) {
              docx
                .renderAsync(blob, this.docxContainer.nativeElement, undefined, {
                  className: 'docx-preview-container',
                  inWrapper: true,
                })
                .catch((err) => console.error(err));
            }
          }, 100);
        },
        error: () => {
          this.isLoadingDoc.set(false);
          alert('Error al renderizar el documento.');
        },
      });
  }

  downloadDocument() {
    this.validationService
      .getValidatedBlob(this.trackingCode(), this.dni(), this.certificateCode())
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.certificateCode()}.docx`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}
