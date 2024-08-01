import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class CompanyToCompanyMarkupService {

    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getCompanyToCompanyMarkupList(model): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CompanyToCompanyMarkup/GetCompanyToCompanyMarkupList', model);
    }

    getCompanyToCompanyMarkupRecord(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CompanyToCompanyMarkup/getCompanyToCompanyMarkupRecord', { id });
    }

    delete(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CompanyToCompanyMarkup/delete', { id });
    }

    create(model): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CompanyToCompanyMarkup/create', model);
    }
}
