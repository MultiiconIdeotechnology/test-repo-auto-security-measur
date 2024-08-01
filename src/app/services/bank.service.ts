import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BankService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Bank/create', model);
  }

  getBankList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Bank/getBankList', model);
  }

  getBankRecord(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Bank/getBankRecord', {id:id});
  }

  delete(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Bank/delete', {id:id});
  }

  setAudit(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Bank/setAudit', {id:id});
  }

}
