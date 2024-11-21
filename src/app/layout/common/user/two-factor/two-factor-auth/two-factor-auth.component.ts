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
import { UserService } from 'app/core/user/user.service';

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
    currentUser:any = {};
    isTfaEnabled:boolean = false;

    constructor(
        // private settingService:SettingsService,
        public matDialogRef: MatDialogRef<TwoFactorAuthComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any = {},
        private _matdialog: MatDialog,
        public twoFaAuthenticationService: TwoFaAuthenticationService,
        private confirmationService: FuseConfirmationService,
        private alertService: ToasterService,
        public _userService: UserService
    ) {

    }

    ngOnInit(): void {
        this.isTfaEnabled = this.twoFaAuthenticationService.twoFactorMethod.some((item:any) => item.is_enabled) 
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
            if (res == 'confirmed') {
                this.twoFaAuthenticationService.changeAuthMode({ "Mode": method.tfa_type }).subscribe({
                    next: (res) => {
                        if (res && res.status) {
                            this.twoFaAuthenticationService.twoFactorMethod.forEach((field: any) => field.is_selected = false);;
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
