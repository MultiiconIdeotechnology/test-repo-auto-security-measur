import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { User } from 'app/core/user/user.types';
import { SetPasswordComponent } from 'app/layout/common/user/set-password/set-password.component';
import { VerificationDialogComponent } from 'app/layout/common/user/two-factor/verification-dialog/verification-dialog.component';
import { map, Observable, ReplaySubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);
    isOtpEnabled: boolean = true;
    totpConfig = [
        "account_wallet_recharge_audit", 
        "account_wallet_recharge_reject" ,
        "account_wallet_recharge_generate_payment_link",
        "account_wallet_credit_add",
        "account_wallet_credit_disable",
        "account_wallet_credit_enable",
        "account_withdraw_audit",
        "account_withdraw_reject",
        "account_receipt_audit",
        "account_receipt_reject",
        "settings_supplier_api_add",
        "settings_supplier_api_enable",
        "settings_supplier_api_disable",
        "settings_supplier_api_modify",
        "settings_supplier_api_delete",
        "settings_psp_modify",
        "settings_psp_delete",
        "settings_psp_deactive",
        "settings_psp_set_default",
        "settings_psp_add",
        "settings_markup_add",
        "settings_markup_modify",
        "settings_markup_delete",
        "settings_markup_set_default"
      ]
    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private matDialog: MatDialog,

    ) {
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
        const dialogRef = this.matDialog.open(VerificationDialogComponent, {
            width: '450px',
            data: "Whatsapp",
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
            console.log("check array includes", data.title)
            if (this.isOtpEnabled) { // need to dynamically
                this.openVerifyDialog().subscribe(isVerified => {
                    if (isVerified) {
                        console.log("success on otp verified");
                        // return;
                        onSuccess();
                    } else {
                        // Optionally handle failed verification
                        console.log("OTP verification failed.");
                    }
                });
            } else {
                // Execute directly if OTP is not enabled
                console.log("otp is not verfiend enter")
                // return
                onSuccess();
            }

        } else {
            console.log("direct on Success");
            onSuccess();
        }
    }
}