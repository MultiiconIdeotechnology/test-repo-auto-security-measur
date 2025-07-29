import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, of, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CurrencyService {
    currencyList: any;
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getcurrencyCombo(): Observable<any[]> {
        return this.http.post<any[]>(this.baseUrl + 'currency/getcurrencyCombo', {});
    }

    getcurrencyList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'currency/getcurrencyList', model);
    }

    create(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'currency/create', model);
    }

    getcurrencyRecord(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'currency/getcurrencyRecord', { id: id });
    }

    delete(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'currency/delete', { id: id });
    }

    getCurrencyComboCashed() {
        if (this.currencyList) {
            return of(this.currencyList);
        } else {
            return this.http.post<any[]>(this.baseUrl + 'currency/getcurrencyCombo', {}).pipe(
                tap(data => this.currencyList = data) // cache the result
            );
        }
    }
}
