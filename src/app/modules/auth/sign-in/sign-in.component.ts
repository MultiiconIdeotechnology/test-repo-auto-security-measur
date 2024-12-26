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
import { NgOtpInputModule } from 'ng-otp-input';
import { TwoFaAuthenticationService } from 'app/services/twofa-authentication.service';
import { ToasterService } from 'app/services/toaster.service';
import { TwoFactorAuthComponent } from 'app/layout/common/user/two-factor/two-factor-auth/two-factor-auth.component';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [RouterLink, FuseAlertComponent, NgIf, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule, NgOtpInputModule],
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;
    isSignInShow: boolean = true;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;
    is_recovery_code_show: boolean = false;
    isFirstTime: boolean = true;
    captcha: any = {};
    json_data: any = {};
    is_auth_enabled: any = "";
    login_code: any;
    authotp: any;
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _matDialog: MatDialog,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        public twoFaAuthService: TwoFaAuthenticationService,
        private alertService: ToasterService,
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

        if (this.captcha.value && this.captcha.ans !== this.captcha.value) {
            this.refreshCaptcha();
            this.alert = {
                type: 'error',
                message: 'Invalid Captcha'
            };
            this.showAlert = true;
            return;
        } else if(!this.captcha.value){
            this.alert = {
                type: 'error',
                message: 'Please enter a valid Captcha'
            };
            this.showAlert = true;
            return;
        }
        // if (this.captcha.ans !== this.captcha.value) {
        //     this.refreshCaptcha();
        //     this.alert = {
        //         type: 'error',
        //         message: 'Invalid Captcha'
        //     };
        //     this.showAlert = true;
        //     return;
        // }

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
                        if(res && res.authtype) {
                            this.isSignInShow = false; // need to do
                            this.is_auth_enabled = res.authtype;
                            this.login_code = res.code;
                            this.json_data = json;
                        } else {
                            this.finalSignIn(res.code, json);
                        }
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

    // final SignIn
    finalSignIn(code: any, json: any) {
        let extBody: any = {}
        if(this.authotp != null) { // Is Auth active to pass otp
            extBody.otp = this.authotp;
            extBody.authtype = this.is_auth_enabled;
        }
        this._authService.Login(code, json, true, extBody).subscribe({
            next: res => {
                const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
                // Navigate to the redirect url
                this._router.navigateByUrl(redirectURL);

                // need to do
                if(!extBody.authtype) {
                    this._matDialog.open(TwoFactorAuthComponent, {
                        width:'900px',
                        autoFocus: false,
                        disableClose: true,
                        closeOnNavigation: false,
                        data: {}
                    })
                }
            }, error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
            }
        });
    }

    // OTP Verify and Login
    confirmAndLogin() {
        if (this.authotp && this.authotp.length >= 6) {
            this.finalSignIn(this.login_code, this.json_data);
        }
    }

    // OTP On Change event
    onOtpChange(event: any) {
        this.authotp = event;
        if (this.authotp && this.authotp.length == 6 && this.isFirstTime) {
            this.finalSignIn(this.login_code, this.json_data);
            this.isFirstTime = false;
        }
    }
}
