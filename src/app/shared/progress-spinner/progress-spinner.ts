import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-progress-spinner',
  imports: [],
  templateUrl: './progress-spinner.html',
  styleUrl: './progress-spinner.scss',
})
export class ProgressSpinner implements OnInit, OnDestroy {
  @Input() visible = false;
  LoadingService = inject(LoadingService);
  private sub: Subscription | null = null;

  ngOnInit() {
    this.sub = this.LoadingService.loading$.subscribe((v: boolean) => (this.visible = v));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
