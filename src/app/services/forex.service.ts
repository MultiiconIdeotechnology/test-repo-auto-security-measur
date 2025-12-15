import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ForexService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getLeadList(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "forexlead/getLeadList", model);
  }

  getCityCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'city/getCityCombo', { filter });
  }

  getSupplierForexCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'forexlead/getSupplierCombo', { filter });
  }

  getLeadRecord(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "forexlead/getLeadRecord", {id: id});
  }

  getcurrencyCombo(): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'currency/getcurrencyCombo', {});
  }

  setLeadStatus(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "forexlead/setLeadStatus", model);
  }

  printInvoice(invoiceId: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "AirBooking/printInvoice", {invoiceId:invoiceId});
  }

  getSupplierBoCombo(type?: string): Observable<any> {
      return this.http.post<any>(this.baseUrl + "Supplier/getSupplierBoCombo", { type: type });
  }

}
