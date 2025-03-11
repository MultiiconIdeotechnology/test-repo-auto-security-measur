import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SupplierWalletBalanceService {


  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getSupplierBalance(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AccountReport/getProviderBalance', model);
  }

  balanceSync(){
    return this.http.get<any>(this.baseUrl + 'cronjob/editSupplierBalance ');
  }

  getSupplierCombo(filter: string, type?: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'Supplier/getSupplierCombo', { filter: filter, type: type });
  }


}
