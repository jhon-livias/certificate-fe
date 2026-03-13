import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ValidationService {
  private http = inject(HttpClient);

  validateCredentials(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.BASE_URL}/public/validate-certificate`, payload);
  }

  getValidatedBlob(trackingCode: string, dni: string, code: string): Observable<Blob> {
    return this.http.get(
      `${environment.BASE_URL}/public/download-certificate/${trackingCode}?dni=${dni}&code=${code}`,
      {
        responseType: 'blob',
      },
    );
  }
}
