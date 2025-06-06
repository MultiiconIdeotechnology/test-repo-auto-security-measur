import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable,of } from 'rxjs';
import { tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private baseUrl = environment.apiUrl;
  receiptDataList:any
  isCollectionListLoaded:boolean = false;
  isReceptionListLoaded:boolean = false;

  constructor(private http: HttpClient) {}

  getPaymentList(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "Payment/getPaymentList", model);
  }

  getPaymentLinkList(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "paymentlink/getpaymentlinkList", model);
  }

  getPaymentLinkRecord(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "paymentlink/getpaymentlinkRecord", model);
  }

  createPaymentLink(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'paymentlink/create', model);
  }

  deletePaymentLink(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "paymentlink/delete", { id });
  }

  getPaymentLinkService(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + "paymentlink/getservices");
  }

  getReceiptList(model: any): Observable<any> {
      return this.http.post<any>(environment.apiUrl + "Receipt/getReceiptList", model)
  }
  
  getCollectionList(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "AccountReport/getProductCollectionReport", model);
  }

  getPaymentRecord(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "Payment/getPaymentRecord", { id });
  }

  delete(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "Payment/delete", { id });
  }

  getReceiptRecord(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "Receipt/getReceiptRecord", { id });
  }

  setAuditUnaudit(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Receipt/audit', { id });
  }

  Receiptdelete(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Receipt/delete', { id });
  }

  reject(id: any, note?:string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Receipt/reject', { id:id, reject_reason:note });
  }

  downloadInvoice(bookingId: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Receipt/printInvoice', { invoiceId: bookingId });
  }

  getReceiptRegister(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "Receipt/getReceiptListRegister", model);
  }

  getFirstTransaction(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "AccountReport/FirstTransactionReport", model);
  }

  getcommissionExpense(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "AccountReport/CommissionExpenseReport", model);
  }

  getcommissionIncome(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "AccountReport/CommissionIncomeReport", model);
  }

  getpurchaseRegister(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "AccountReport/PurchaseRegisterReport", model);
  }
  
  allServiceAnalysis(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "ContractReport/allServiceAnalysis", model);
  }

  // account 2.0
  getBontonPurchaseRegister(model:any){
    return this.http.post<any>(environment.apiUrl + "AccountReport/getPurchaseRegisterReport", model);
  }

  manageServiceFee(model){
    return this.http.post<any>(environment.apiUrl + "AirBooking/manageServiceFee", model);
  }


}
