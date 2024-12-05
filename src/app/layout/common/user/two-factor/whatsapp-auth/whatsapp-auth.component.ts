import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TwoFactorAuthComponent } from '../two-factor-auth/two-factor-auth.component';
import { TwoFaAuthenticationService } from 'app/services/twofa-authentication.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgOtpInputModule } from 'ng-otp-input';
import { ToasterService } from 'app/services/toaster.service';
import { UserService } from 'app/core/user/user.service';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-whatsapp-auth',
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, NgOtpInputModule],
    templateUrl: './whatsapp-auth.component.html'
})
export class WhatsappAuthComponent {
    authotp: any;
    disableBtn: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    user: any = {};
    company_number: any;
    isButtonDisabled: boolean = false;
    timer: number = 59;
    countdownInterval: any;
    isOtpInputShow: boolean = false;

    constructor(
        // private settingService:SettingsService,
        public matDialogRef: MatDialogRef<TwoFactorAuthComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any = {},
        private _matdialog: MatDialog,
        public twoFaAuthenticationService: TwoFaAuthenticationService,
        private alertService: ToasterService,
        public _userService: UserService,
        private confirmationService: FuseConfirmationService,
    ) {
        if (data && data.tfa_type == 'Whatsapp' && data.key == 'whatsapp-disabled') {
            this.whatsappOtpsent();
            this.isOtpInputShow = true;
        }

        this._userService.user$.pipe((takeUntil(this._unsubscribeAll))).subscribe((user: any) => {
            this.user = user;
            this.company_number = user?.company_number;
        });
    }

    // OTP On Change event
    onOtpChange(event: any) {
        this.authotp = event;
    }

    // whatsapp otp Sent
    whatsappOtpsent() {
        this.twoFaAuthenticationService.mobileVerificationOTP({ tfa_type: "Whatsapp" }).subscribe({
            next: (res) => {
                if (res && res.status) {
                    this.startCountdown();
                }
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
            },
        });
    }


    // Authentication verification
    authConfigureNow(mode: any) {
        if (this.authotp && this.authotp.length >= 6) {
            let payload: any = {
                Mode: mode,
                Otp: this.authotp,
            };
            this.disableBtn = true;
            this.twoFaAuthenticationService.twoFactoreCheck(payload).subscribe({
                next: (res) => {
                    if (res) {
                        for (let i in this.twoFaAuthenticationService.twoFactorMethod) {
                            if (this.twoFaAuthenticationService.twoFactorMethod[i].tfa_type == mode) {
                                this.twoFaAuthenticationService.twoFactorMethod[i].is_enabled = true;
                                this.twoFaAuthenticationService.twoFactorMethod[i].is_selected = true;
                            } else {
                                this.twoFaAuthenticationService.twoFactorMethod[i].is_selected = false;
                            }
                        }
                  
                        this.twoFaAuthenticationService.isTfaEnabled = true;
                        this.disableBtn = false;
                        this.alertService.showToast('success', `${mode} authentication successfull!`, 'top-right', true);
                        this.matDialogRef.close();
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

    // Auth Disabled
    authVerifyDisabled(mode: any) {
        let message = mode == 'AuthApp' ? 'two-step verification?' : 'whatsapp authentication'
        this.confirmationService.open({
            title: `Are you sure you want to disable ${message}`,
            message: '',
            icon: {
                show: true,
                color: 'error'
            },
            actions: {
                confirm: {
                    label: 'Disable',
                    color: 'warn'
                },
                cancel: {
                    label: 'No',
                },
            },
        }).afterClosed().subscribe((res) => {
            if (res == 'confirmed') {
                if (this.authotp && this.authotp.length >= 6) {
                    let payload = {
                        Mode: mode,
                        Otp: this.authotp,
                    };
                    this.disableBtn = true;
                    this.twoFaAuthenticationService.disableTwoFactoreAuth(payload).subscribe({
                        next: (res) => {
                            if (res && res.status) {
                                for (let i in this.twoFaAuthenticationService.twoFactorMethod) {
                                    if (this.twoFaAuthenticationService.twoFactorMethod[i].tfa_type == mode) {
                                        this.twoFaAuthenticationService.twoFactorMethod[i].is_enabled = false;
                                        this.twoFaAuthenticationService.twoFactorMethod[i].is_selected = false;
                                    }

                                    if(res.data){
                                        if(this.twoFaAuthenticationService.twoFactorMethod[i].tfa_type == res.data.tfa_type) {
                                            // this.twoFaAuthenticationService.twoFactorMethod[i].is_enabled = true;
                                            this.twoFaAuthenticationService.twoFactorMethod[i].is_selected = true;
                                        }
                                    }
                                }
                                this.twoFaAuthenticationService.isTfaEnabled = res.data ? true: false;
                                
                                this.disableBtn = false;
                                let message = mode == 'AuthApp' ? 'Two-factor' : mode;
                                this.alertService.showToast('success', `${message} authentication disabled successfully!`, 'top-right', true);
                                this.matDialogRef.close();
                            }
                        },
                        error: (err) => {
                            this.disableBtn = false;
                            this.alertService.showToast('error', err, 'top-right', true);
                        },
                    });
                }
            }
        });

    }

    resendOtp() {
        if (!this.isButtonDisabled) {
            this.isOtpInputShow = true;
            this.whatsappOtpsent();
        }
    }

    startCountdown() {
        this.isButtonDisabled = true;
        this.timer = 59;

        this.countdownInterval = setInterval(() => {
            if (this.timer > 0) {
                this.timer--;
            } else {
                this.isButtonDisabled = false;
                clearInterval(this.countdownInterval);
            }
        }, 1000);
    }

    // Two FactorAuth Dialog
    openTF2AuthModal() {
        this.matDialogRef.close();
        this._matdialog.open(TwoFactorAuthComponent, {
            width: '900px',
            autoFocus: true,
            disableClose: true,
            closeOnNavigation: false,
            data: {}
        })
    }

    onKeyPress(event:KeyboardEvent, key:string){
        if(event.key == 'Enter' && this.authotp?.length == 6 ){
            if(this.data.key == 'Whatsapp'){
                this.authConfigureNow('Whatsapp');
            } else {
                this.authVerifyDisabled(key);
            }
        }
    }

    ngOnDestroy(): void {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
    }
}
