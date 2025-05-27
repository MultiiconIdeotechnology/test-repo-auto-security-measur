import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RefferralService {

    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getReferralLinkList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ReferralLink/getReferralLinkList', model);
    }

    getEmployeeLeadAssignCombo(filter: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'employee/getEmployeeLeadAssignCombo', { filter });
    }

    create(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ReferralLink/create', model);
    }

    delete(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ReferralLink/delete', { id: id });
    }

    setReferalLinkEnable(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ReferralLink/setReferralLinkEnable', { id: id });
    }

    statusChange(model:any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'StatusChangeLogs/getStatusChangeLogsList', model);
    }

    // spent api
    getSpentList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CampaignSpent/campaignwiselist', model);
    }
    
    createSpent(model:any){
        return this.http.post<any>(this.baseUrl + 'CampaignSpent/create', model);
    }

    deleteSpentRowById(id:any){
        return this.http.post<any>(this.baseUrl + 'CampaignSpent/delete', {id:id});
    }


}