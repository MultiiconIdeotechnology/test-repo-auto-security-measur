import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getWalletCreditList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'WalletCredit/getWalletCreditList', model);
  }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'WalletCredit/create', model);
  }

  getWalletCreditRecord(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'WalletCredit/getWalletCreditRecord', { id: id });
  }

  setEnable(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'WalletCredit/setEnable', { id: id });
  }

  delete(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'WalletCredit/delete', { id: id });
  }

  getCreditActivity(model:any){
    return this.http.post<any>(this.baseUrl + 'WalletCredit/getCreditLogs', model);
  }


}