import { Routes } from '@angular/router';

export const pagesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./templates/pages/templates').then((c) => c.Templates),
      },
      {
        path: 'estudiantes/listado',
        loadComponent: () =>
          import('./students/pages/student-list/student-list').then((c) => c.StudentList),
      },
      {
        path: 'estudiantes/carga',
        loadComponent: () =>
          import('./students/pages/student-upload/student-upload').then((c) => c.StudentUpload),
      },
      {
        path: 'plantillas',
        loadComponent: () => import('./templates/pages/templates').then((c) => c.Templates),
      },
      {
        path: 'generar-envio',
        loadComponent: () =>
          import('../pages/generate-send/generate-send').then((c) => c.GenerateSend),
      },
      { path: '', redirectTo: 'estudiantes/listado', pathMatch: 'full' },
    ],
  },
];
