import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { User } from 'app/core/user/user.types';
import { SetPasswordComponent } from 'app/layout/common/user/set-password/set-password.component';
import { VerificationDialogComponent } from 'app/layout/common/user/two-factor/verification-dialog/verification-dialog.component';
import { map, Observable, ReplaySubject, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class UserService
{
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private matDialog: MatDialog,

    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: any)
    {

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

    get user$(): Observable<any>
    {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(): Observable<User>
    {
        return this._httpClient.get<User>('api/common/user').pipe(
            tap((user) =>
            {
                this._user.next(user);
            }),
        );
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any>
    {
        return this._httpClient.patch<User>('api/common/user', {user}).pipe(
            map((response) =>
            {
                this._user.next(response);
            }),
        );
    }

    openVerifyDialog(
        title: string,
        width: string = '450px'
      ): Observable<boolean> {
        const dialogRef = this.matDialog.open(VerificationDialogComponent, {
          width,
          data: { title },
        });
    
        return dialogRef.afterClosed();
      }
}
