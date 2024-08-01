import { NgIf, NgFor, AsyncPipe, NgClass, DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { AbstractControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { EmployeeService } from 'app/services/employee.service';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  standalone: true,
  imports: [RouterLink, NgIf, NgClass, FuseAlertComponent, FormsModule, DatePipe, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule, RouterLink,
    MatOptionModule, MatSelectModule, NgxMatSelectSearchModule, NgFor, MatIconModule, AsyncPipe, MatDividerModule],
})
export class ChangePasswordComponent {

  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };
  setPassForm: UntypedFormGroup;
  showAlert: boolean = false;

  constructor(
    public matDialogRef: MatDialogRef<ChangePasswordComponent>,
    private alertService: ToasterService,
    private EmployeeService: EmployeeService,
    private _formBuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any = []
  ) {
  }

  ngOnInit(): void {
    this.setPassForm = this._formBuilder.group({
      oldPassword: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', [Validators.required]],
    },
      {
        validator: ConfirmPasswordValidator("password", "passwordConfirm")
      }
    );
  }

  regex(regex: string): boolean {
    const passPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    return passPattern.test(regex);
  }

  setPass(): void {

    if (this.setPassForm.get('password').value != this.setPassForm.get('passwordConfirm').value) {
      this.setPassForm.markAllAsTouched();
      return;
    }

    if (this.setPassForm.invalid) {
      this.alertService.showToast('error', 'The validation error needs to be corrected.')
      return;
    }
    this.showAlert = false;
    const json = {
      oldPassword: this.setPassForm.get('oldPassword').value,
      newPassword: this.setPassForm.get('password').value
    }

    this.EmployeeService.ChangePassword(json).subscribe({
      next: (res) => {
        this.matDialogRef.close();
        // this._router.navigate(['/sign-out']);
        this.alertService.showToast('success', 'Password Updated!');
      },
      error: (err) => {
        this.alertService.showToast('error', err);
      }
    });
  }

  // signOut(): void {
  //   this.matDialogRef.close();
  //   this._router.navigate(['/sign-out']);
  // }

}

export function ConfirmPasswordValidator(controlName: string, matchingControlName: string) {
  return (setPassForm: FormGroup) => {
    let control = setPassForm.controls[controlName];
    let matchingControl = setPassForm.controls[matchingControlName]
    if (
      matchingControl.errors &&
      !matchingControl.errors.confirmPasswordValidator
    ) {
      return;
    }
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ confirmPasswordValidator: true });
    } else {
      matchingControl.setErrors(null);
    }
  };
}
