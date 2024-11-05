import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SetUpTwoFactorAuthComponent } from '../set-up-two-factor-auth/set-up-two-factor-auth.component';
import { MatButtonModule } from '@angular/material/button';

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
            icon:'phone_iphone',
            is_enabled: false,
            is_selected: false,
            tfa_type: 'AuthApp'
        },
        {
            title: 'SMS/Text Message',
            content: 'Get one-time codes sent to your phone via SMS to complete authentication requests.',
            iconDark: 'assets/icons/messenger-dark.svg',
            icon:'messenger_outline',
            is_enabled: false,
            is_selected: false,
            tfa_type: 'SMS'
        },
        {
            title: 'WhatsApp Message',
            content: 'Get one-time codes sent to your phone via WhatsApp to complete authentication requests.',
            iconDark: 'assets/icons/whatsapp-dark.svg',
            icon:'whatsapp',
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
    ) {

    }

    ngOnInit(): void {
        // this.settingService.settings
        //         .pipe(takeUntil(this._unsubscribeAll))
        //         .subscribe((settings) => {
        //             this.settings = settings;
        //         });
    }

    authenticationEnabled(authName: any) {
        this.matDialogRef.close();
        this._matdialog.open(SetUpTwoFactorAuthComponent, {
            width: '825px',
            disableClose: false,
            data: {}
        })
    }

    // Authentication Disabled
    authenticationDisabled(method: any) {

    }

    // switch Authentication
    switchAuthentication(method: any) {

    }
}
