import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProgressSpinner } from './shared/progress-spinner/progress-spinner';
import { Toast } from './shared/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProgressSpinner, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('certificate-fe');
}
