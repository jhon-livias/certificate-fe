import { Injectable, signal } from '@angular/core';

export interface ToastData {
  text: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root', // Esto lo hace global y accesible desde cualquier lado
})
export class ToastService {
  // Aquí vive el estado de tu mensaje flotante
  toastSignal = signal<ToastData | null>(null);

  private timeoutId: any;

  show(text: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toastSignal.set({ text, type });

    // Si ya había un temporizador corriendo (alguien hizo doble click rápido), lo limpiamos
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // A los 3.5 segundos, lo ocultamos automáticamente
    this.timeoutId = setTimeout(() => {
      this.hide();
    }, 3500);
  }

  hide() {
    this.toastSignal.set(null);
  }
}
