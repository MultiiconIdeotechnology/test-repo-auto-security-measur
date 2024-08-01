import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPaymentList(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "Payment/getPaymentList", model);
  }

  getReceiptList(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "Receipt/getReceiptList", model);
  }

  getPaymentRecord(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "Payment/getPaymentRecord", { id });
  }

  getReceiptRecord(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "Receipt/getReceiptRecord", { id });
  }

}
