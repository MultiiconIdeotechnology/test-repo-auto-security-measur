import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AgentsRMwiseService {
    private baseUrl = environment.apiUrl;
    constructor(private http: HttpClient) { }

    rmwiseAgentsList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CRM/Reshuffle/getRMWiseAgentList', model);
    }

    rmwiseLeadsList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CRM/Reshuffle/getRMWiseLeadList', model);
    }
}
