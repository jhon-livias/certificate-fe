import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop'; // Importante
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './student-list.html',
  styleUrl: './student-list.css',
})
export class StudentList implements OnInit {
  private studentService = inject(StudentService);
  students = toSignal(this.studentService.getList(), { initialValue: [] });
  totalRecords = toSignal(this.studentService.getTotal(), { initialValue: 0 });

  // Signal to hold the current search input
  searchTerm = signal<string>('');
  currentPage = signal<number>(1);
  limit = signal<number>(10);
  isLoading = signal<boolean>(false);

  totalPages = computed(() => {
    const total = Math.ceil(this.totalRecords() / this.limit());
    return total > 0 ? total : 1;
  });

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents() {
    this.isLoading.set(true);
    this.studentService.callGetList(this.limit(), this.currentPage(), this.searchTerm()).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar la lista:', err);
        this.isLoading.set(false);
      },
    });
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.loadStudents();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadStudents();
    }
  }
}
