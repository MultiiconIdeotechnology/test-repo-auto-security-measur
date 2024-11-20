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

    tfaConfigDetailsData: any[] = [];
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


    constructor(private http: HttpClient) { 
        if (this.tfaConfigDetailsData && !this.tfaConfigDetailsData?.length) {
            this.getEmployee();
        } 
    }

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

      // GEt Employee TFA Configuration Details
      getEmployee() {
        this.tfaConfigurationDetails().subscribe({
            next: (resData) => {
                this.tfaConfigDetailsData = resData;
                this.twoFactorMethodUpdate(this.tfaConfigDetailsData);
            },
            error: (err) => {
                console.log("err", err);
            },
        });
    }


    // to update the twoFactormethod  
    twoFactorMethodUpdate(tfConfingData:any) {
        if (tfConfingData) {
            for (let i in tfConfingData) {
                for (let j in this.twoFactorMethod) {
                    if (tfConfingData[i].tfa_type == this.twoFactorMethod[j].tfa_type) {
                        this.twoFactorMethod[j].is_enabled = tfConfingData[i].is_enabled;
                        this.twoFactorMethod[j].is_selected = tfConfingData[i].is_selected;
                    }
                }
            }
        }
    }
}