import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TwoFaAuthenticationService } from 'app/services/twofa-authentication.service';
import { SetUpTwoFactorAuthComponent } from '../set-up-two-factor-auth/set-up-two-factor-auth.component';
import { WhatsappAuthComponent } from '../whatsapp-auth/whatsapp-auth.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ToasterService } from 'app/services/toaster.service';

@Component({
    selector: 'app-two-factor-auth',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule
    ],
    templateUrl: './two-factor-auth.component.html',
    styleUrls: ['./two-factor-auth.component.scss']
})
export class TwoFactorAuthComponent {
    settings: any = {};
    twoFactorMethod: any = [
        {
            title: 'Authenticator App',
            content: 'Use an authentication app or browser extension to get two-factor authentication codes when prompted.',
            iconDark: 'assets/icons/smartphone-dark.svg',
            icon: 'phone_iphone',
            is_enabled: false,
            is_selected: false,
            tfa_type: 'AuthApp'
        },
        {
            title: 'SMS/Text Message',
            content: 'Get one-time codes sent to your phone via SMS to complete authentication requests.',
            iconDark: 'assets/icons/messenger-dark.svg',
            icon: 'messenger_outline',
            is_enabled: false,
            is_selected: false,
            tfa_type: 'SMS'
        },
        {
            title: 'WhatsApp Message',
            content: 'Get one-time codes sent to your phone via WhatsApp to complete authentication requests.',
            iconDark: 'assets/icons/whatsapp-dark.svg',
            icon: 'whatsapp',
            is_enabled: false,
            is_selected: false,
            tfa_type: 'Whatsapp'
        },
    ];

    constructor(
        // private settingService:SettingsService,
        public matDialogRef: MatDialogRef<TwoFactorAuthComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any = {},
        private _matdialog: MatDialog,
        private twoFaAuthenticationService: TwoFaAuthenticationService,
        private confirmationService: FuseConfirmationService,
        private alertService: ToasterService,
    ) {

    }

    ngOnInit(): void {
        this.getEmployee();
    }

    // GEt Employee TFA Configuration Details
    getEmployee() {
        this.twoFaAuthenticationService.tfaConfigurationDetails().subscribe({
            next: (resData) => {
                if (resData) {
                    for (let i in resData) {
                        for (let j in this.twoFactorMethod) {
                            if (resData[i].tfa_type == this.twoFactorMethod[j].tfa_type) {
                                this.twoFactorMethod[j].is_enabled = resData[i].is_enabled;
                                this.twoFactorMethod[j].is_selected = resData[i].is_selected;
                            }
                        }
                    }
                }
            },
            error: (err) => {
                console.log("err", err);
            },
        });
    }

    // authentication Enabled Dialog
    authenticationEnabled(method: any) {
        this.matDialogRef.close();
        if (method.tfa_type == 'AuthApp') {
            this._matdialog.open(SetUpTwoFactorAuthComponent, {
                width: '900px',
                autoFocus: true,
                disableClose: true,
                data: {}
            })
        } else {
            method.key = 'Whatsapp';
            this._matdialog.open(WhatsappAuthComponent, {
                width: '825px',
                autoFocus: true,
                disableClose: true,
                data: method
            })
        }
    }

    // Authentication Disabled
    authenticationDisabled(method: any) {
        this.matDialogRef.close();
        method.key = 'whatsapp-disabled';
        this._matdialog.open(WhatsappAuthComponent, {
            width: '825px',
            autoFocus: true,
            disableClose: true,
            data: method
        })
    }

    // switch Authentication
    switchAuthentication(method: any) {
        this.confirmationService.open({
            title: 'Are you sure you want to switch the another method?',
            message: '',
            icon: {
                show: true,
                color: 'primary'
            },
            actions: {
                confirm: {
                    label: 'Yes, switch',
                    color: 'accent'
                },
                cancel: {
                    label: 'No',
                },
            },
        }).afterClosed().subscribe((res) => {
            console.log("res", res);
            if (res == 'confirmed') {
                this.twoFaAuthenticationService.changeAuthMode({ "Mode": method.tfa_type }).subscribe({
                    next: (res) => {
                        if (res && res.status) {
                            this.twoFactorMethod.filter((field: any) => field.is_selected = false);
                            method.is_selected = true;
                            this.alertService.showToast('success', 'Authentication method has been successfully switched.', 'top-right', true);
                        }
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);
                    },
                });
            }
        });
    }
}
