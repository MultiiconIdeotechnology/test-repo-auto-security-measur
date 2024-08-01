import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WithdrawService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'WalletWithdraw/create', model);
  }

  getWalletWithdrawList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'WalletWithdraw/getWalletWithdrawList', model);
  }

  getWalletWithdrawRecord(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'WalletWithdraw/getWalletWithdrawRecord', {id:id});
  }

  setWithdrawAudit(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'WalletWithdraw/setWithdrawAudit', {id:id});
  }

  setWithdrawReject(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'WalletWithdraw/setWithdrawReject', model);
  }
 
}
