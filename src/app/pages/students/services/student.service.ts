import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { Student, StudentListResponse } from '../models/student.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  apiService = inject(ApiService);
  router = inject(Router);

  students: Student[] = [];
  students$: BehaviorSubject<Student[]> = new BehaviorSubject<Student[]>(this.students);

  total: number = 0;
  total$: BehaviorSubject<number> = new BehaviorSubject<number>(this.total);

  callGetList(limit: number = 10, page: number = 1, search: string = ''): Observable<void> {
    let url = `students?limit=${limit}&page=${page}`;
    if (search) {
      url += `&search=${search}`;
    }
    return this.apiService.get<StudentListResponse>(url).pipe(
      map((response: StudentListResponse) => {
        this.updateStudents(response.data);
        this.updateTotalStudents(response.paginate.total);
      }),
    );
  }

  getList(): Observable<Student[]> {
    return this.students$.asObservable();
  }

  getTotal(): Observable<number> {
    return this.total$.asObservable();
  }

  getOne(code: string): Observable<Student> {
    return this.apiService.get(`students/${code}`);
  }

  uploadBulk(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('document', file);
    return this.apiService.post<any>('students/bulk-upload', formData);
  }

  private updateStudents(value: Student[]): void {
    this.students = value;
    this.students$.next(this.students);
  }

  private updateTotalStudents(value: number): void {
    this.total = value;
    this.total$.next(this.total);
  }
}
