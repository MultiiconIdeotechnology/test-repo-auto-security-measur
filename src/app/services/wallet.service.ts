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

  getWalletRechargeFilterList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'WalletRecharge/getWalletRechargeFilterList', model);
  }

  getWalletRechargeRecord(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'WalletRecharge/getWalletRechargeRecord', { id: id });
  }

  setRechargeAudit(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'WalletRecharge/setRechargeAudit', { id: id });
  }

  setRechargeReject(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'WalletRecharge/setRechargeReject', model);
  }

  getWlCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'WlSettings/getWlCombo', { filter });
  }

  getModeOfPaymentCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'WalletRecharge/getModeOfPaymentCombo', { filter });
  }

  getPaymentGatewayCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'PaymentGateway/getPaymentGatewayCombo', { filter });
  }

  offlineRecharge(model: any): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'WalletRecharge/offlineRecharge', model);
  }

  
}
