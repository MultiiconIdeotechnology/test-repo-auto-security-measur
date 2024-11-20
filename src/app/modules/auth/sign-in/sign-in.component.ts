import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { keys } from 'app/common/const';
import { AuthService } from 'app/core/auth/auth.service';
import { OtpComponent } from '../otp/otp.component';
import { Linq } from 'app/utils/linq';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [RouterLink, FuseAlertComponent, NgIf, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule],
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;
    captcha: any = {};

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _matDialog: MatDialog,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            rememberMe: [true],
        });

        this.refreshCaptcha();

        this.signInForm.get('email').valueChanges.subscribe(text => {
            this.signInForm.get('email').patchValue(Linq.convertToLowerCase(text), { emitEvent: false });
        })
    }

    refreshCaptcha(): void {
        this.captcha.disabled = true;
        this._authService.captchaTerminal().subscribe({
            next: c => {
                this.captcha.image = 'data:image/png;base64,' + c.image;
                this.captcha.ans = parseInt(this._authService.decrypt(keys.permissionHash, c.ans));
                this.captcha.disabled = false;
                this.captcha.value = '';
            }, error: () => {
                this.alert = {
                    type: 'error',
                    message: 'Failed to refresh captcha'
                };
                this.showAlert = true;

                this.captcha.disabled = false;
                this.captcha.value = '';
            }
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        if (this.captcha.ans !== this.captcha.value) {
            this.refreshCaptcha();
            this.alert = {
                type: 'error',
                message: 'Invalid Captcha'
            };
            this.showAlert = true;
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;
        const json = this.signInForm.getRawValue();
        json.domain = '';
        // Sign in
        this._authService.signIn(json)
            .subscribe({
                next: (res) => {
                    // Set the redirect url.
                    // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                    // to the correct page after a successful sign in. This way, that url can be set via
                    // routing file and we don't have to touch here.
                    if (res.code) {
                        this._authService.Login(res.code, json, true).subscribe({
                            next: res => {
                                console.log("res in login", res)
                                const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';

                                // Navigate to the redirect url
                                this._router.navigateByUrl(redirectURL);
                            }
                        })
                    } else {
                        this._matDialog.open(OtpComponent, {
                            data: json,
                        }).afterClosed().subscribe(() => this.signInForm.enable())
                    }

                },
                error: (response) => {
                    // Re-enable the form
                    this.signInForm.enable();

                    // Reset the form
                    this.signInNgForm.resetForm();

                    // Set the alert
                    this.alert = {
                        type: 'error',
                        message: response,
                    };

                    // Show the alert
                    this.showAlert = true;
                },
            });
    }
}
