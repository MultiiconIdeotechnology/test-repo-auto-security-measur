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
        "wallet_recharge_audit", 
        "wallet_recharge_reject" ,
        // "wallet_recharge_generate_payment_link",
        "wallet_credit_add",
        "wallet_credit_disable",
        "wallet_credit_enable",
        "withdraw_audit",
        "withdraw_reject",
        "receipt_audit",
        "receipt_reject",
        "supplier_api_add",
        "supplier_api_enable",
        "supplier_api_disable",
        "supplier_api_modify",
        "supplier_api_delete",
        "psp_modify",
        "psp_delete",
        "psp_deactive",
        "psp_set_default",
        "psp_add",
        "markup_add",
        "markup_modify",
        "markup_delete",
        "markup_set_default"
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
                        onSuccess();
                    } else {
                        // Optionally handle failed verification
                        console.log("OTP verification failed.");
                    }
                });
            } else {
                // Execute directly if OTP is not enabled
                onSuccess();
            }

        } else {
            console.log("direct on Success");
            return;
            onSuccess();
        }
    }
}