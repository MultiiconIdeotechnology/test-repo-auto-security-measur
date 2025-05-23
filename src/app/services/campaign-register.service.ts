import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CampaignRegisterService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    getcampaignRegisterReport(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ReferralLink/getCampaignRegister', model);
    }

}