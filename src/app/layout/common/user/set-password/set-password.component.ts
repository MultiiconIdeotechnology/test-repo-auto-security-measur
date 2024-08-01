import { AsyncPipe, CommonModule, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { AbstractControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDivider, MatDividerModule } from '@angular/material/divider';
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
import { timer } from 'rxjs';

@Component({
    selector: 'app-set-password',
    standalone: true,
    imports: [RouterLink, NgIf, FuseAlertComponent, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule, RouterLink,
        MatOptionModule, MatSelectModule, NgxMatSelectSearchModule, NgFor, MatIconModule, AsyncPipe, MatDividerModule],
    templateUrl: './set-password.component.html',
})
export class SetPasswordComponent {

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    setPassForm: UntypedFormGroup;
    showAlert: boolean = false;

    constructor(
        public matDialogRef: MatDialogRef<SetPasswordComponent>,
        private alertService: ToasterService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _authService: AuthService,
        private EmployeeService: EmployeeService,
        @Inject(MAT_DIALOG_DATA) public data: any = []
    ) {
        
    }

    ngOnInit(): void {
        this.setPassForm = this._formBuilder.group({
            password: ['', [Validators.required, Validators.minLength(8)]],
            passwordConfirm: ['', [Validators.required, confirmPasswordValidator]],
        });

        this.setPassForm.get('password').valueChanges
        .subscribe(() => {
            this.setPassForm.get('passwordConfirm').updateValueAndValidity();
        });
    }

    regex(regex: string): boolean {
        const passPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
        return passPattern.test(regex);
    }

    setPass(): void {
        if (this.setPassForm.invalid) {
            this.alertService.showToast('error', 'The validation error needs to be corrected.')
            return;
        }

        this.showAlert = false;

        const json = {
            password: this.setPassForm.get('password').value
        }
        this.EmployeeService.setPassword(json).subscribe({
            next: (res) => {
                this.matDialogRef.close();
                this._router.navigate(['/sign-out']);
                this.alertService.showToast('success', 'Password Updated!')
            },
            error: (err) => {
                this.alertService.showToast('error', err);
            }
        });
    }

    signOut(): void {
        this.matDialogRef.close();
        this._router.navigate(['/sign-out']);
    }

}



/**
 * Confirm password validator
 *
 * @param {AbstractControl} control
 * @returns {ValidationErrors | null}
 */
export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    if (!control.parent || !control) {
        return null;
    }

    const password = control.parent.get('password');
    const passwordConfirm = control.parent.get('passwordConfirm');

    if (!password || !passwordConfirm) {
        return null;
    }

    if (passwordConfirm.value === '') {
        return null;
    }

    if (password.value === passwordConfirm.value) {
        return null;
    }

    return { passwordsNotMatching: true };
};