import { Component, Input } from '@angular/core';

@Component({
  selector: 'bz-input-button',
  imports: [],
  templateUrl: './input-button.component.html',
  styleUrl: './input-button.component.scss',
})
export class InputButtonComponent {
  @Input() label: string | null = null;
  @Input() type: string = "button";
  @Input() disabled: boolean = false;
}
