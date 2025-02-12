import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, filter } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LeadsRegisterService {

    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    leadMasterRegisterList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'AgentReport/leadMasterRegisterList', model);
    }

    setRelationManager(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/setRelationManager', model);
    }

    getEmployeeLeadAssignCombo(filter: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'employee/getEmployeeLeadAssignCombo', {filter});
    }

    leadSouceCombo(filter: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'leadmaster/leadSouceCombo', {filter});
    }

    leadRMChange(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'leadmaster/leadRMChange', model);
    }

    relationshipManagerLogsList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'leadmaster/leadrelationManagerChangeLogs', model);
    }

    leadBulkUpload(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'AgentReport/leadBulkUpload', model);
    }

    deadLeadToLiveLead(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'leadmaster/DeadToLiveLead', model);
    }

    syncLeads(){
        return this.http.post<any>(this.baseUrl + 'CronJob/leadStoreCronJob', {});
    }
}
