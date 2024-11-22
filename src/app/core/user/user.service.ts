import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { User } from 'app/core/user/user.types';
import { SetPasswordComponent } from 'app/layout/common/user/set-password/set-password.component';
import { TwoFactorAuthComponent } from 'app/layout/common/user/two-factor/two-factor-auth/two-factor-auth.component';
import { VerificationDialogComponent } from 'app/layout/common/user/two-factor/verification-dialog/verification-dialog.component';
import { TwoFaAuthenticationService } from 'app/services/twofa-authentication.service';
import { map, Observable, ReplaySubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);
    isOtpEnabled: boolean = false;
    // _currentUser:any = {};
    totpConfig:any[] = [];
    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private matDialog: MatDialog,
        private tf2AuthService:TwoFaAuthenticationService,

    ) {
        this._user.subscribe((user) => {
            this.totpConfig = (JSON.parse(user['totp_config'])).totpConfig;
        });

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: any) {

        // if(value.is_first) {
        //     setTimeout(() => {

        //         this.matDialog.open(SetPasswordComponent, {
        //             data: value,
        //             disableClose: true
        //         }).afterClosed().subscribe(res => {
        //         })
        //     }, 1000);
        // }

        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<any> {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(): Observable<User> {
        return this._httpClient.get<User>('api/common/user').pipe(
            tap((user) => {
                this._user.next(user);
            }),
        );
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any> {
        return this._httpClient.patch<User>('api/common/user', { user }).pipe(
            map((response) => {
                this._user.next(response);
            }),
        );
    }

    // Method to open dialog and verify OTP
    openVerifyDialog(): Observable<boolean> {
        let selectedTf2Method = this.tf2AuthService.twoFactorMethod.find((item:any) => item.is_enabled && item.is_selected);
        const dialogRef = this.matDialog.open(VerificationDialogComponent, {
            width: '450px',
            data: selectedTf2Method,
        });

        return dialogRef.afterClosed().pipe(
            map(result => !!result) // Convert result to a boolean
        );
    }

    // Method to execute a function after verifying OTP if needed
    verifyAndExecute(
        data: { title: string },
        onSuccess: () => void
    ): void {
        if(this.totpConfig.includes(data.title)){
            if (this.tf2AuthService.isTfaEnabled) { // need to dynamically
                this.openVerifyDialog().subscribe(isVerified => {
                    if (isVerified) {
                        onSuccess();
                    } else {
                        // Optionally handle failed verification
                        console.log("OTP verification failed.");
                    }
                });
            } else {
                // Execute directly if OTP is not enabled
                console.log("otp is not enabled enter")
                onSuccess();
            }

        } else {
            console.log("direct on Success");
            onSuccess();
        }
    }

  
}