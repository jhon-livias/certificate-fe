export interface IStudent {
  id: number;
  studentCode: string;
  documentNumber: string;
  fullName: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  admissionMode: string;
  program: string;
  campus: string;
  modality: string;
  shift: string;
  status: string;
  graduationYear: string;
}

export class Student implements IStudent {
  id: number;
  studentCode: string;
  documentNumber: string;
  fullName: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  admissionMode: string;
  program: string;
  campus: string;
  modality: string;
  shift: string;
  status: string;
  graduationYear: string;

  constructor(student: IStudent) {
    this.id = student.id;
    this.studentCode = student.studentCode;
    this.documentNumber = student.documentNumber;
    this.fullName = student.fullName;
    this.gender = student.gender;
    this.email = student.email;
    this.phone = student.phone;
    this.address = student.address;
    this.admissionMode = student.admissionMode;
    this.program = student.program;
    this.campus = student.campus;
    this.modality = student.modality;
    this.shift = student.shift;
    this.status = student.status;
    this.graduationYear = student.graduationYear;
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
