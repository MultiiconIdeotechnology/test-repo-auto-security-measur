import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToasterService } from 'app/services/toaster.service';
import { UserService } from 'app/core/user/user.service';
import { Subject, takeUntil } from 'rxjs';
import { TwoFaAuthenticationService } from 'app/services/twofa-authentication.service';
import { NgOtpInputModule } from 'ng-otp-input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-verification-dialog',
    standalone: true,
    imports: [
        CommonModule,
        NgOtpInputModule,
        MatIconModule,
        MatButtonModule
    ],
    templateUrl: './verification-dialog.component.html',
    styleUrls: ['./verification-dialog.component.scss']
})
export class VerificationDialogComponent {
    authotp: any;
    disableBtn: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    user: any = {};

    constructor(
        public matDialogRef: MatDialogRef<VerificationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any = {},
        public twoFaAuthenticationService: TwoFaAuthenticationService,
        private alertService: ToasterService,
        public _userService: UserService,
    ) {

        if (data && data.tfa_type == 'Whatsapp') {
            this.whatsappOtpsent();
        }

        this._userService.user$.pipe((takeUntil(this._unsubscribeAll))).subscribe((user: any) => {
            this.user = user;
        });
    }

    // whatsapp otp Sent
    whatsappOtpsent() {
        this.twoFaAuthenticationService.mobileVerificationOTP({ tfa_type: "Whatsapp" }).subscribe({
            next: (res) => { },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
            },
        });
    }

    // OTP On Change event
    onOtpChange(event: any) {
        this.authotp = event;
        if (this.authotp && this.authotp.length == 6) {
            this.verifyOtp(this.data.tfa_type);
        }
    }

    // Authentication verification
    verifyOtp(mode: any) {
        if (this.authotp && this.authotp.length >= 6) {
            let payload: any = {
                Mode: mode,
                Otp: this.authotp,
            };
            this.disableBtn = true;
            this.twoFaAuthenticationService.verifyOtp(payload).subscribe({
                next: (res) => {
                    if (res) {
                        this.disableBtn = false;
                        this.alertService.showToast('success', `${mode} authentication successfull!`, 'top-right', true);
                        this.matDialogRef.close(true);
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

}