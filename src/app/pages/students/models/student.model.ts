export interface IStudent {
  id: number;
  name: string;
  surname: string;
  dni: string;
  programType: string;
  program: string;
  period: string;
  email: string;
  status: string;
}

export class Student implements IStudent {
  id: number;
  name: string;
  surname: string;
  dni: string;
  programType: string;
  program: string;
  period: string;
  email: string;
  status: string;

  constructor(student: IStudent) {
    this.id = student.id;
    this.name = student.name;
    this.surname = student.surname;
    this.dni = student.dni;
    this.programType = student.programType;
    this.program = student.program;
    this.period = student.period;
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
