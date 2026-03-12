import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Login } from '../../interfaces';
import { AuthService } from '../../services/auth.service';

import { CommonModule } from '@angular/common';
import { InputButtonComponent } from '../../../shared/input-button/input-button.component';
import { InputCheckboxComponent } from '../../../shared/input-checkbox/input-checkbox.component';
import { InputTextComponent } from '../../../shared/input-text/input-text.component';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputButtonComponent,
    InputCheckboxComponent,
    InputTextComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  login() {
    const { username = '', password = '' } = this.loginForm.value;
    const body: Login = { username, password };
    this.authService.login(body).subscribe();
  }
}
