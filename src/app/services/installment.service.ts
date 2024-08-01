import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InstallmentService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getWlPaymentPolicyList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'WlPaymentPolicy/getWlPaymentPolicyList', model);
  }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'WlPaymentPolicy/create', model);
  }

  getWlPaymentPolicyRecord(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'WlPaymentPolicy/getWlPaymentPolicyRecord', model);
  }

  setPaymentAudit(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'WlPaymentPolicy/setPaymentAudit', { id: id });
  }

  delete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'WlPaymentPolicy/delete', { id: id });
  }

  getWlPaymentPolicyCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'WlPaymentPolicy/getWlPaymentPolicyCombo', { filter });
  }

}