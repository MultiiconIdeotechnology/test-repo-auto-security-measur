import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { SettingsService } from 'app/services/settings.service';
// import { takeUntil } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SetUpTwoFactorAuthComponent } from '../set-up-two-factor-auth/set-up-two-factor-auth.component';

@Component({
  selector: 'app-two-factor-auth',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './two-factor-auth.component.html',
  styleUrls: ['./two-factor-auth.component.scss']
})
export class TwoFactorAuthComponent {
  settings: any = {};

  constructor(
    // private settingService:SettingsService,
    public matDialogRef: MatDialogRef<TwoFactorAuthComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {},
    private _matdialog: MatDialog,
  ){
   
  }

  ngOnInit():void {
    // this.settingService.settings
    //         .pipe(takeUntil(this._unsubscribeAll))
    //         .subscribe((settings) => {
    //             this.settings = settings;
    //         });
  }

  twoFactorMethod = [
    {
        title: 'Authenticator App',
        content: 'Use an authentication app or browser extension to get two-factor authentication codes when prompted.',
        iconDark: 'assets/icons/smartphone-dark.svg',
        icon:'phone_iphone',
        isEnabled: false,
        isSelected: false,
        page: 'auth'
    },
    {
        title: 'SMS/Text Message',
        content: 'Get one-time codes sent to your phone via SMS to complete authentication requests.',
        iconDark: 'assets/icons/messenger-dark.svg',
        icon:'messenger_outline',
        isEnabled: false,
        isSelected: false,
        page: 'sms'
    },
    {
        title: 'WhatsApp Message',
        content: 'Get one-time codes sent to your phone via WhatsApp to complete authentication requests.',
        iconDark: 'assets/icons/whatsapp-dark.svg',
        icon:'whatsapp',
        isEnabled: false,
        isSelected: false,
        page: 'whatsApp'
    },
];

authenticationEnabled(){
  this.matDialogRef.close();
  this._matdialog.open(SetUpTwoFactorAuthComponent, {
    width:'825px',
    disableClose: false,
    data: {}
})
}

}
