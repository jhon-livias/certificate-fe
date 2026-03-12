import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth-guard';
import { guestGuard } from './auth/guards/guest-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout').then((c) => c.Layout),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/pages.routes').then((m) => m.pagesRoutes),
      },
    ],
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
  },
  { path: '', pathMatch: 'full', redirectTo: '' },
];
