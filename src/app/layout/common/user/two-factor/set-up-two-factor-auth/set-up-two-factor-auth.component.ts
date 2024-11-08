import { Component, Inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { FuseAlertComponent } from '@fuse/components/alert';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { TwoFaAuthenticationService } from 'app/services/twofa-authentication.service';
import { ToasterService } from 'app/services/toaster.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NgOtpInputModule } from 'ng-otp-input';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
    selector: 'app-set-up-two-factor-auth',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink, FuseAlertComponent, NgIf, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule,
        MatDividerModule,
        NgOtpInputModule
    ],
    templateUrl: './set-up-two-factor-auth.component.html',
    styleUrls: ['./set-up-two-factor-auth.component.scss']
})
export class SetUpTwoFactorAuthComponent {
    currentStep: number = 1;
    twoFaFormGroup: FormGroup;
    disableBtn: boolean = false;
    twoFactorEnabledList: any = {};
    transformQr: any;
    recoveryCodes: any = [];
    authotp: any;
    isCodeCopy: boolean = false;

    stepArr: any[] = [
        { step: 1, label: 'SETUP', isActive: true, isCompleted: false },
        { step: 2, label: 'CONNECT MOBILE', isActive: false, isCompleted: false },
        { step: 3, label: 'SAVES CODES', isActive: false, isCompleted: false },
    ]

    constructor(
        private builder: FormBuilder,
        public matDialogRef: MatDialogRef<SetUpTwoFactorAuthComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any = {},
        public twoFaAuthenticationService: TwoFaAuthenticationService,
        private alertService: ToasterService,
        private sanitizer: DomSanitizer,
        private clipboard: Clipboard,
    ) { }

    ngOnInit(): void {
        this.twoFaFormGroup = this.builder.group({
            enablePassword: ['', Validators.required],
        });
    }

    // Auth Password Verification
    authEnableStep() {
        this.disableBtn = true;
        if (!this.twoFaFormGroup.valid) {
            this.alertService.showToast('error', "Please enter password!");
            return;
        }

        const json = this.twoFaFormGroup.getRawValue();
        const newJson = {
            password: json.enablePassword ? json.enablePassword : '',
        };
        this.twoFaAuthenticationService.verifyPassword(newJson).subscribe({
            next: (resp: any) => {
                this.disableBtn = false;
                if (resp.status) {
                    this.alertService.showToast('success', 'Password verified successfully!', 'top-right', true);
                    this.twoFactorEnabled();
                } else {
                    this.alertService.showToast('error', resp.msg, 'top-right', true);
                }
            },
            error: (err) => {
                this.disableBtn = false;
                this.alertService.showToast('error', err, 'top-right', true);
            },
        });
    }

    // Auth two Factor Enabled
    twoFactorEnabled() {


        let body = {
            "tfa_type": "AuthApp"
            // "tfa_type": "Whatsapp"
        }
        this.twoFaAuthenticationService.twoFactorEnabled(body).subscribe({
            next: (res) => {
                if (res) {
                    this.twoFactorEnabledList = res;
                    this.transformQr =
                        this.sanitizer.bypassSecurityTrustResourceUrl(
                            this.twoFactorEnabledList.baseQR
                        );
                    this.disableBtn = false;
                    this.recoveryCodes = JSON.parse(res?.recoveryCodes || "");
                    this.alertService.showToast('success', 'Two-factor authentication enabled successfully!', 'top-right', true);
                    if (this.currentStep < 3) {
                        this.currentStep++;
                        this.changeStep(this.currentStep);
                    }
                }
            },
            error: (err) => {
                this.disableBtn = false;
                this.alertService.showToast('error', err, 'top-right', true);
            },
        });
    }

    // Authentication verification
    authConfigureNow(mode: any) {
        if (this.authotp && this.authotp.length >= 6) {
            let payload = {
                Mode: mode,
                Otp: this.authotp,
            };
            this.twoFaAuthenticationService.twoFactoreCheck(payload).subscribe({
                next: (res) => {
                    if (res) {
                        this.disableBtn = false;
                        let message = mode == 'AuthApp' ? 'Two factor' : mode;
                        this.alertService.showToast('success', `${message} authentication successfull!`, 'top-right', true);

                        if (this.currentStep < 3 && mode == 'AuthApp') {
                            this.currentStep++;
                            this.changeStep(this.currentStep);
                        }
                    }
                },
                error: (err) => {
                    this.disableBtn = false;
                    this.alertService.showToast('error', err, 'top-right', true);
                },
            });
        } else {
            this.alertService.showToast('error', 'Please enter valid otp', 'top-right', true);
        }
    }

    // OTP On Change event
    onOtpChange(event: any) {
        this.authotp = event;
    }

    // Step Changes
    changeStep(nextStep: number) {
        this.currentStep = nextStep;
        this.stepArr.forEach((step) => {
            if (step.step < nextStep) {
                step.isCompleted = true;
                step.isActive = false;
            } else if (step.step === nextStep) {
                step.isActive = true;
                step.isCompleted = false;
            } else {
                step.isActive = false;
                step.isCompleted = false;
            }
        });
    }

    // two Factor Code Copy
    twoFactorCopyLink(key: any) {
        this.clipboard.copy(key);
        this.alertService.showToast('success', 'Copied');
    }

    // Copy Codes
    copyCodes() {
        const codesToCopy = this.recoveryCodes.join('\n');
        navigator.clipboard.writeText(codesToCopy).then(() => {
            this.isCodeCopy = true;
            this.alertService.showToast('success', 'Recovery codes have been copied to the clipboard!', 'top-right', true);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }
}