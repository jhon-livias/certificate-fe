import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../services/api.service';

// Interfaz rápida para tipar las plantillas
export interface Template {
  id: number;
  name: string;
  code: string; // Cambiado
  fileName: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  apiService = inject(ApiService);
  private http = inject(HttpClient);

  templates: Template[] = [];
  templates$: BehaviorSubject<Template[]> = new BehaviorSubject<Template[]>(this.templates);

  callGetList(): Observable<Template[]> {
    return this.apiService.get<Template[]>('certificates').pipe(
      tap((response: Template[]) => {
        this.updateTemplates(response);
      }),
    );
  }

  getList(): Observable<Template[]> {
    return this.templates$.asObservable();
  }

  uploadTemplate(name: string, codePrefix: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('code', codePrefix);
    formData.append('document', file);
    return this.apiService.post<any>('certificates', formData);
  }

  updateTemplate(id: number, name: string, code: string, file: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('code', code);
    if (file) {
      formData.append('document', file);
    }

    return this.apiService.post<any>(`certificates/${id}`, formData);
  }

  deleteTemplate(id: number): Observable<any> {
    return this.apiService.delete<any>(`certificates/${id}`);
  }

  downloadTemplate(id: number): Observable<Blob> {
    return this.http.get(`${environment.BASE_URL}/certificates/${id}/download`, {
      responseType: 'blob',
    });
  }

  private updateTemplates(value: Template[]): void {
    this.templates = value;
    this.templates$.next(this.templates);
  }
}
