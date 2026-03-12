import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((c) => c.LoginComponent),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
