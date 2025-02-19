import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, take } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CashbackParameterService {
    private baseUrl = environment.apiUrl;

    cashbackIdSubject = new BehaviorSubject<any>('');
    cashBackId$ = this.cashbackIdSubject.asObservable();

    private cashbackListSubject = new BehaviorSubject<any[]>([]);
    cashbackList$ = this.cashbackListSubject.asObservable();

    private companyListSubject = new BehaviorSubject<any[]>([]);
    companyList$ = this.companyListSubject.asObservable();

    constructor(private http: HttpClient) { }

    getCashbackParametersList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'cashbackparameters/getCashbackParametersList', model);
    }

    create(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'cashbackparameters/create', model);
    }

    setEnableDisable(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'cashbackparameters/setEnableDisable', { id: id });
    }

    delete(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'cashbackparameters/delete', { id: id });
    }

    getCompanyCombo(filter: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Company/getCompanyCombo', { filter });
    }

    // cashbackId subject to to get the last value of cashbackid;
    setCashbackId(id: any): void {
        this.cashbackIdSubject.next(id);
    }

    // last updated datalist for cashback
    setCashbackList(list: any[]): void {
        this.cashbackListSubject.next(list);
    }

    updateCashbackItem(updatedItem: any): void {
        this.cashbackListSubject.pipe(take(1)).subscribe(currentList => {
            const updatedList = currentList.map(item =>
                item.id === updatedItem.id ? updatedItem : item
            );
            this.cashbackListSubject.next(updatedList);
        });
    }
    

    addCashbackItem(newItem: any): void {
        const currentList = this.cashbackListSubject.value;
        this.cashbackListSubject.next([newItem, ...currentList]); // Push new item
    }

    // get companyList/cashbackfor list
    setCompanyList(data: any): void {
        this.companyListSubject.next(data);
    }
 
}
