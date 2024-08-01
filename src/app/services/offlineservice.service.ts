import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfflineserviceService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getOfflineServiceBookingList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'OfflineServiceBooking/getOfflineServiceBookingList', model);
  }
 
  getOsbPurchaseList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'OsbPurchase/getOsbPurchaseList', model);
  }
  
  getOsbPaymentList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'OfflineServiceBooking/getOsbPaymentList', model);
  }
  
  getOsbReceiptList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'OfflineServiceBooking/getOsbReceiptList', model);
  }
  
  getOsbInvoice(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'OfflineServiceBooking/getOsbInvoice', model);
  }
  
  getOsbSalesList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'OsbSales/getOsbSalesList', model);
  }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'OfflineServiceBooking/create', model);
  }

  purchaseCreate(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'OsbPurchase/create', model);
  }

  createPaymentEntry(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'OfflineServiceBooking/createPaymentEntry', model);
  }

  createReceiptEntry(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'OfflineServiceBooking/createReceiptEntry', model);
  }
  
  createInvoiceEntry(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'OfflineServiceBooking/createInvoiceEntry', model);
  }

  salesCreate(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'OsbSales/create', model);
  }

  delete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'OfflineServiceBooking/delete', { id: id });
  }
  
  deletePurchase(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'OsbPurchase/delete', { id: id });
  }
  
  deleteSales(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'OsbSales/delete', { id: id });
  }

  getOfflineServiceBookingRecord(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'OfflineServiceBooking/getOfflineServiceBookingRecord', { id: id });
  }

  getOsbPurchaseRecord(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'OsbPurchase/getOsbPurchaseRecord', { id: id });
  }
  
  getOsbSalesRecord(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'OsbSales/getOsbSalesRecord', { id: id });
  }


}
