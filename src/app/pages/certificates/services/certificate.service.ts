import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CertificateService {
  private http = inject(HttpClient);

  generateCertificate(payload: {
    student_code: string;
    certificate_id: number;
    certificate_code: string;
  }): Observable<any> {
    return this.http.post<any>(`${environment.BASE_URL}/generate-certificate`, payload);
  }

  downloadGenerated(id: number): Observable<Blob> {
    return this.http.get(`${environment.BASE_URL}/certificates/download-generated/${id}`, {
      responseType: 'blob',
    });
  }

  sendEmail(
    id: number,
    payload: { email: string; cc_emails: string[]; body: string },
  ): Observable<any> {
    return this.http.post<any>(`${environment.BASE_URL}/certificates/${id}/send-email`, payload);
  }
}
