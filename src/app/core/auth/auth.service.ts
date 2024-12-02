import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { keys } from 'app/common/const';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import CryptoJS from 'crypto-js';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { FuseNavigationItem, Navigations } from '@fuse/components/navigation';
import { MatDialog } from '@angular/material/dialog';
import { SetPasswordComponent } from 'app/layout/common/user/set-password/set-password.component';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false
    private permissions: any[];
    baseUrl = environment.apiUrl;
    user: any = {};
    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private matDialog: MatDialog
    ) {
        var user = localStorage.getItem('user');
        if (!user)
            user = sessionStorage.getItem('user')

        if (user && user.trim() !== '') {
            this.user = JSON.parse(this.decrypt(keys.permissionHash, user));
            this._userService.user = this.user;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    // forgotPassword(email: string): Observable<any> {
    //     return this._httpClient.post('api/auth/emp/forgot-password', email);
    // }

    forgotPassword(email: string): Observable<any[]> {
        return this._httpClient.post<any[]>(this.baseUrl + 'auth/emp/forgotPassword', { email:email });
    }

    /**
     * Reset password
     *
     * @param password
     */
    // resetPassword(password: string): Observable<any> {
    //     return this._httpClient.post('api/auth/reset-password', password);
    // }
    resetPassword(model: any): Observable<any> {
        return this._httpClient.post(environment.apiUrl + 'auth/emp/resetPassword', model);
    }

    Login(code: any, credentials: any, is_master: any, twoFaAuth?: any): Observable<any> {
        let body = {
            code: code, 
            is_master: is_master
        }
        return this._httpClient.post(this.baseUrl + 'auth/emp/login', body).pipe(
            switchMap((response: any) => {
                // Store the access token in the local storage
                localStorage.setItem('filterData', JSON.stringify(response?.filterData || []));
                // Set the authenticated flag to true
                this._authenticated = true;

                this.storeInfo(response, credentials.rememberMe)
                // Store the user on the user service
                const user = JSON.parse(this.decrypt(keys.permissionHash, response.user))
                
                this._userService.user = user;
                // Return a new observable with the response
                return of(response);
            })
        );
    }

    private storeInfo(response, rememberMe): void {
        // if (rememberMe) {
            localStorage.setItem('accessToken', response.token)
            localStorage.setItem('user', response.user);
            localStorage.setItem('permissions', response.permissions);

            sessionStorage.setItem('accessToken', response.token)
            sessionStorage.setItem('user', response.user);
            sessionStorage.setItem('permissions', response.permissions);
        // } else {
        //     sessionStorage.setItem('accessToken', response.token)
        //     sessionStorage.setItem('user', response.user);
        //     sessionStorage.setItem('permissions', response.permissions);
        // }
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string, rememberMe: boolean }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated)
            return throwError(() => 'User is already logged in.');

        return this._httpClient.post(this.baseUrl + 'auth/emp/preLogin', credentials)
    }

    changeLogo(file: any): Observable<any> {
        return this._httpClient.post<any>(environment.apiUrl + 'auth/b2c/changeLogo', {file});
    }

    getWlLogo(): Observable<any> {
        return this._httpClient.post<any>(environment.apiUrl + 'auth/b2c/getWlLogo', {});
    }

    captchaTerminal(): Observable<any> {
        return this._httpClient.post<any>(environment.apiUrl + 'auth/b2c/captchaTerminal', {});
    }


    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this._httpClient.post('api/auth/sign-in-with-token', {
            accessToken: this.accessToken,
        }).pipe(
            catchError(() =>

                // Return false
                of(false),
            ),
            switchMap((response: any) => {
                // Replace the access token with the new one if it's available on
                // the response object.
                //
                // This is an added optional step for better security. Once you sign
                // in using the token, you should generate a new one on the server
                // side and attach it to the response object. Then the following
                // piece of code can replace the token with the refreshed one.
                if (response.accessToken) {
                    // this.accessToken = response.accessToken;
                }

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return true
                return of(true);
            }),
        );
    }

    public decrypt(key: string, ciphertextB64: string): string {
        const pkey = CryptoJS.enc.Utf8.parse(key);
        const iv = CryptoJS.lib.WordArray.create([0x00, 0x00, 0x00, 0x00]);
        const decrypted = CryptoJS.AES.decrypt(ciphertextB64, pkey, { iv: iv });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        localStorage.removeItem('permissions');
        sessionStorage.removeItem('permissions');
        localStorage.removeItem('filterData');

        this._userService.user = null;
        this.user = null;

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        return of(!AuthUtils.isTokenExpired(this.accessToken));

        // If the access token exists, and it didn't expire, sign in using it
        // return this.signInUsingToken();
    }

    // public hasPermission(group_name: string, operation_type: string, category_name: string, module_name: string): boolean {
    //     return this.getPermissions().findIndex(p => p.module_name === module_name && p.group_name === group_name && p.operation_type === operation_type && p.category_name === category_name) > -1;
    // }

    public hasPermission(group_name: string, operation_type: string, category_name: string, module_name: string): boolean {
        return this.getPermissions().findIndex(p => p.module_name === module_name && p.group_name === group_name && p.operation_type === operation_type && p.category_name === category_name) > -1;
    }

    public getPermissions(): any[] {
        if (!this.permissions || this.permissions.length === 0) {
            const per = localStorage.getItem('permissions') || sessionStorage.getItem('permissions');
            if (per) {
                this.permissions = JSON.parse(this.decrypt(keys.permissionHash, per));
            } else {
                this.permissions = [];
            }

            this.generatePID(this.permissions);
        }
        return this.permissions;
    }

    public generatePID(permissions: any[]): void {
        if (!permissions) {
            return;
        }

        for (const permission of permissions) {
            try {
                permission['pid'] = permission.group_name.replaceAll(' ', '').toUpperCase() + '_' +
                    permission.operation_type.replaceAll(' ', '').toUpperCase() + '_' +
                    permission.category_name.replaceAll(' ', '').toUpperCase();
            }
            catch (e) {
                break;
            }
        }
    }

    public verifyNavigationUsingPermissions(navigation: Navigations[]): Navigations[] {
        let nav: Navigations[] = JSON.parse(JSON.stringify(navigation));

        nav = [];
        this.recursiveVerifyMenu(navigation, nav);
        return nav;
    }

    private recursiveVerifyMenu(nav: FuseNavigationItem[], menu: FuseNavigationItem[]): void {
        for (const n of nav) {
            if (this.hasListPermission(n.pid)) {
                const m = JSON.parse(JSON.stringify(n));
                m.children = [];
                menu.push(m);
                if (n.children) {
                    this.recursiveVerifyMenu(n.children, m.children);
                }
            }
        }
    }

    public hasListPermission(pid: string): boolean {
        const result = this.getPermissions().findIndex(p => p.pid === pid) > -1;
        return result;
    }

}
