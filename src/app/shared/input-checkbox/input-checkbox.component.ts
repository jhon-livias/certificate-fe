import { Component, Input } from '@angular/core';

@Component({
  selector: 'bz-input-checkbox',
  imports: [],
  templateUrl: './input-checkbox.component.html',
  styleUrl: './input-checkbox.component.scss',
})
export class InputCheckboxComponent {
  @Input() label: string | null = null;
  @Input() id: string | null = null;
}
