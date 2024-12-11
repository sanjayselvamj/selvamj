import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AbstractControl,ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-new-ac',
  templateUrl: './new-ac.component.html',
  styleUrls: ['./new-ac.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    NgIf,
    RouterModule // Import NgIf for conditionally displaying error messages
  ]
})
export class NewACComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(4)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  // Custom Validator for matching passwords
  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;  // No validation error if one or both fields are empty
    }

    return password.value === confirmPassword.value ? null : { mismatch: true };
  }
  onRegister() {
    // Check if the form is valid
    if (this.registerForm.valid) {
      const { username, password } = this.registerForm.value;
      console.log('Registering user:', username);

      // Call the addUser method from the AuthService to register the user
      this.authService.addUser(username, password).subscribe({
        next: (response) => {
          console.log('Response from backend:', response);

          if (response.success) {
            this.successMessage = 'Registration successful! Redirecting to login...';

            // Clear any previous error messages
            this.errorMessage = '';

            // Redirect to the login page after a 2-second delay
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            // Handle backend failure (non-success response)
            this.errorMessage = response.message || 'Registration failed. Please try again.';
          }
        },
        error: () => {
          // Handle error from backend (e.g., network issues)
          this.errorMessage = 'Registration failed. Please try again.';
        }
      });
    } else {
      // If the form is invalid, show an error message
      this.errorMessage = 'Please fill out the form correctly.';
    }
  }


  navigateToLogin() {
    this.router.navigate(['/login']);
  }

}
