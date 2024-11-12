import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TwoFaAuthenticationService {
    otpConfig: any = {
        length: 6,
        inputClass: 'ng-otp-input-box',
        containerClass: 'ng-otp-container',
        isPasswordInput: false,
    };

    constructor(private http: HttpClient) { }

    verifyPassword(model: any): Observable<any> {
        return this.http.post<any>(environment.apiUrl + 'TFAConfiguration/VerifyPassword', model);
    }

    twoFactorEnabled(model: any): Observable<any> {
        return this.http.post<any>(environment.apiUrl + 'TFAConfiguration/twoFactorEnable', model);
    }

    twoFactoreCheck(model: any): Observable<any> {
        return this.http.post<any>(environment.apiUrl + 'TFAConfiguration/twoFactorCheck', model);
    }

    disableTwoFactoreAuth(model: any): Observable<any> {
        return this.http.post<any>(environment.apiUrl + 'TFAConfiguration/disableTwoFactorAuth', model);
    }
    
    mobileVerificationOTP(model: any): Observable<any> {
        return this.http.post<any>(environment.apiUrl + 'TFAConfiguration/mobileVerificationOTP', model);
    }
    
    changeAuthMode(model: any): Observable<any> {
        return this.http.post<any>(environment.apiUrl + 'TFAConfiguration/changeAuthMode', model);
    }
    
    tfaConfigurationDetails(): Observable<any> {
        return this.http.post<any>(environment.apiUrl + 'employee/tfaConfigurationDetails', {});
    }

    verifyOtp(model: any): Observable<any> {
        return this.http.post<any>(environment.apiUrl + 'TFAConfiguration/verifyOtp', model);
    }
}