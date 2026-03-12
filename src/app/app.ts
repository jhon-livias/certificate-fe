import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProgressSpinner } from './shared/progress-spinner/progress-spinner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProgressSpinner],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('certificate-fe');
}
