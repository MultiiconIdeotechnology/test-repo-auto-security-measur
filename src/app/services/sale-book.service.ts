import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SaleBookService {

    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getSalesBookReport(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'AccountReport/getSalesBookReport', model);
    }

}