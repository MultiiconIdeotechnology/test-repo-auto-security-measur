import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormControl, FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { FuseValidators } from '@fuse/validators';
import { AuthService } from 'app/core/auth/auth.service';
import { ToasterService } from 'app/services/toaster.service';
import { Subject, finalize } from 'rxjs';
import { confirmPasswordValidator } from '../sign-up/sign-up.component';

@Component({
    selector     : 'auth-reset-password',
    templateUrl  : './reset-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    standalone   : true,
    imports      : [NgIf, FuseAlertComponent, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
})
export class AuthResetPasswordComponent implements OnInit
{
    @ViewChild('resetPasswordNgForm') resetPasswordNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: '',
    };
    resetPasswordForm: UntypedFormGroup;
    showAlert: boolean = false;
    private code: string;
    public npHide = true;
    public rnpHide = true;
    complete: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        public alertService: ToasterService,
        private router: Router,
        private route: ActivatedRoute,
    )
    {
    }

    ngOnInit(): void {

        this.route.queryParamMap.subscribe(params => {
            this.code = params.get('code');

            if (!this.code || this.code.trim() === '') {
                this.router.navigate(['/auth/login']);
            }

            // this._authService.isPasswordResetLinkExpired({ code: this.code }).subscribe(res => {
            //     if (res.expired) {
            //         this.alertService.showToast('error', "Reset Link Expired", "top-right", true);
            //         this.router.navigate(['/auth/login']);
            //     }
            // });
        });

        this.resetPasswordForm = this._formBuilder.group({
            password: new FormControl('', [Validators.required]),
            passwordConfirm: new FormControl('', [Validators.required, confirmPasswordValidator]),
        });

        this.resetPasswordForm.get('password').valueChanges
            .subscribe(() => {
                this.resetPasswordForm.get('passwordConfirm').updateValueAndValidity();
            });
    }

    ngOnDestroy(): void {
        this.complete.next(null);
        this.complete.complete();
    }

    regex(pattern: string): ValidatorFn {
        return (control: AbstractControl) => {
            const regex = new RegExp(pattern);

            if (!regex.test(control.value))
                return { regexexp: true };

            return { regexexp: null };
        };
    }

    public resetPassword(): void {
        if (this.resetPasswordForm.invalid)
            return;

        this._authService.resetPassword({ code: this.code, password: this.resetPasswordForm.get('password').value })
            .subscribe({
                next: () => {
                    this.alertService.showToast('success', "Your password has been reset", "top-right", true);
                    this.router.navigate(['/sign-in']);
                },
                error: err => {
                    this.alertService.showToast('error',err, "top-right", true);
                    this.router.navigate(['/sign-in']);
                }
            });
    }
}
