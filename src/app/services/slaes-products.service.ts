import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, Subject, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class SalesProductsService {

    private baseUrl = environment.apiUrl;

    private remarkAddSubject = new Subject<void>();
            remarkAdd$ = this.remarkAddSubject.asObservable();

    constructor(private http: HttpClient) { }

    getProductReport(model: any, forceRefresh:boolean = false): Observable<any> {
            return this.http.post<any>(this.baseUrl + 'AccountReport/getProductReport', model)
    }

    getAgentSummaryReport(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'AccountReport/getAgentSummaryReport', model);
    }

    createFollowupRemark(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CallHistory/create', model);
    }

    setRemarkAdd(){
        this.remarkAddSubject.next();
    }
}
