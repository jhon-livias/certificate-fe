export interface IStudent {
  id: number;
  studentCode: string;
  documentNumber: string;
  fullName: string;
  program: string;
  modality: string;
  faculty: string;
  cycle: string;
  currentSemester: string;
  email: string;
  status: string;
}

export class Student implements IStudent {
  id: number;
  studentCode: string;
  documentNumber: string;
  fullName: string;
  program: string;
  modality: string;
  faculty: string;
  cycle: string;
  currentSemester: string;
  email: string;
  status: string;

  constructor(student: IStudent) {
    this.id = student.id;
    this.studentCode = student.studentCode;
    this.documentNumber = student.documentNumber;
    this.fullName = student.fullName;
    this.program = student.program;
    this.modality = student.modality;
    this.faculty = student.faculty;
    this.cycle = student.cycle;
    this.currentSemester = student.currentSemester;
    this.email = student.email;
    this.status = student.status;
  }
}

export interface Paginate {
  total: number;
  pages: number;
}

export interface StudentListResponse {
  data: Student[];
  paginate: Paginate;
}
