import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, Subject, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ProductTechService {

    private baseUrl = environment.apiUrl;


    constructor(private http: HttpClient) { }

    getTechServiceReport(model: any): Observable<any> {
            return this.http.post<any>(this.baseUrl + 'AccountReport/techServiceReport', model)
    }

    // getAgentSummaryReport(model: any): Observable<any> {
    //     return this.http.post<any>(this.baseUrl + 'AccountReport/getAgentSummaryReport', model);
    // }

    // createFollowupRemark(model: any): Observable<any> {
    //     return this.http.post<any>(this.baseUrl + 'CallHistory/create', model);
    // }

}
