import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TechBusinessService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTechSummary(model: any): Observable<any>{
    return this.http.post<any>(this.baseUrl + 'AccountReport/rmSummryReport', model);
  }

//   airlineOfflineTatAnalysis(model: any): Observable<any>{
//     return this.http.post<any>(this.baseUrl + 'ContractReport/airlineOfflineTatAnalysis', model);
//   }

//   airlineMonthlyAnalysis(model: any): Observable<any>{
//     return this.http.post<any>(this.baseUrl + 'ContractReport/airlineMonthlyAnalysis', model);
//   }
  
//   airlineRejectionSupplierWiseAnalysis(model: any): Observable<any>{
//     return this.http.post<any>(this.baseUrl + 'ContractReport/airlineRejectionSupplierWiseAnalysis', model);
//   } 
  
//   airlineRejectionCarrierWiseAnalysis(model: any): Observable<any>{
//     return this.http.post<any>(this.baseUrl + 'ContractReport/airlineRejectionCarrierWiseAnalysis', model);
//   }
 
//   airlineRejectionBookingDetailsAnalysis(model: any): Observable<any>{
//     return this.http.post<any>(this.baseUrl + 'ContractReport/airlineRejectionBookingDetailsAnalysis', model);
//   }
 
//   airlineCarrierSummary(model: any): Observable<any>{
//     return this.http.post<any>(this.baseUrl + 'ContractReport/airlineCarrierSummary', model);
//   }
 
}