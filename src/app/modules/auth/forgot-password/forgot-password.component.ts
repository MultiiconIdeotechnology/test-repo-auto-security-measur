import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { ToasterService } from 'app/services/toaster.service';
import { finalize } from 'rxjs';

@Component({
    selector     : 'auth-forgot-password',
    templateUrl  : './forgot-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    standalone   : true,
    imports      : [NgIf, FuseAlertComponent, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, RouterLink],
})
export class AuthForgotPasswordComponent implements OnInit
{
    @ViewChild('forgotPasswordNgForm') forgotPasswordNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: '',
    };
    forgotPasswordForm: UntypedFormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        public alertService: ToasterService,
        private router: Router,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.forgotPasswordForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
        });

        this.forgotPasswordForm.get('email').valueChanges.subscribe(text => {
            this.forgotPasswordForm.get('email').patchValue(text.toLowerCase(), { emitEvent: false });
          })
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Send the reset link
     */
    sendResetLink(): void
    {
        if (this.forgotPasswordForm.invalid)
        return;

        const email = this.forgotPasswordForm.get('email').value;

        this._authService.forgotPassword(email)
            .subscribe({
                next: () => {
                    this.alertService.showToast('success', "Password reset link has been sent to" + email, "top-right", true);
                    this.router.navigate(['/sign-in']);
                }, error: (err) => {
                    this.alertService.showToast('error',err, "top-right", true);
                }
            });
    }
}
