import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CurrencyRoeService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getCurrencyRoeCombo(filter: string): Observable<any[]> {
        return this.http.post<any[]>(this.baseUrl + 'CurrencyRoe/getCurrencyRoeCombo', { filter });
    }

    getcurrencyCombo(): Observable<any[]> {
        return this.http.post<any[]>(
            this.baseUrl + 'currency/getcurrencyCombo',
            {}
        );
    }

    getCurrencyRoeList(model: any): Observable<any> {
        return this.http.post<any>(
            this.baseUrl + 'CurrencyRoe/getCurrencyRoeList',
            model
        );
    }

    create(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CurrencyRoe/create', model);
    }

    getCurrencyRoeRecord(id: any): Observable<any> {
        return this.http.post<any>(
            this.baseUrl + 'CurrencyRoe/getCurrencyRoeRecord',
            { id: id }
        );
    }

    delete(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CurrencyRoe/delete', {
            id: id,
        });
    }

    updateROE(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CurrencyRoe/bulkUpdateRoeMarkup', model);
    }

    sync(): Observable<any> {
        return this.http.get<any>(this.baseUrl + 'CurrencyRoe/updateExchangeRate');
    }
}
