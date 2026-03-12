import { CommonModule } from '@angular/common';
import { Component, Input, Self } from '@angular/core';
import { FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'bz-input-text',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-text.component.html',
  styleUrl: './input-text.component.scss'
})

export class InputTextComponent {
  @Input() label: string | null = null;
  @Input() type: string = "text";
  @Input() placeholder: string | null = null;
  @Input() id: string | null = null;

  constructor(@Self() public controlDir: NgControl) {
    this.controlDir.valueAccessor = this;
  }

  writeValue(obj: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}

  get control(): FormControl {
    return this.controlDir.control as FormControl;
  }
}
