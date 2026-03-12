import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Logout } from '../../auth/interfaces/logout';
import { AuthService } from '../../auth/services/auth.service';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  openStudents = signal(true);
  localStorageService = inject(LocalStorageService);
  router = inject(Router);
  private authService = inject(AuthService);

  user = computed(() => this.localStorageService.get('user'));
  username = computed(() => this.user()?.fullName || 'Invitado');
  initials = computed(() => this.user()?.initials || '??');

  toggleStudents() {
    this.openStudents.update((val) => !val);
  }

  logout() {
    const tokenData = this.localStorageService.get('tokenData');
    const logout: Logout = {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
    };
    this.authService.logout(logout.accessToken, logout.refreshToken).subscribe({
      next: (resp: any) => {
        this.localStorageService.remove('tokenData');
        this.localStorageService.remove('user');
        this.router.navigate(['/auth/login']);
        console.log(resp);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
}
