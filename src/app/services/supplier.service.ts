import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  create(model): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Supplier/create', model);
  }

  createUser(model): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'SupplierUserMaster/create', model);
  }
  
  getSupplierUserMasterList(model): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'SupplierUserMaster/getSupplierUserMasterList', model);
  }

  getSupplierList(model): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Supplier/getSupplierList', model);
  }

  getSupplierRecord(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Supplier/getSupplierRecord', { id });
  }

  delete(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Supplier/delete', { id });
  }
  
  deleteUser(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'SupplierUserMaster/delete', { id });
  }
  
  resetPasswordUser(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'SupplierUserMaster/resetPassword', { id });
  }

  getSupplierCombo(filter: string,OsbId?:string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Supplier/getSupplierCombo', { filter ,OsbId});
  }

  getSupplierComboOfflinePNR(filter: string, type:string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Supplier/getSupplierCombo', { filter, type });
  }

  setBlockUnblock(id: string, note: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Supplier/setBlockUnblock', { id, note });
  }

  setBlockUnblockUser(id: string, note: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'SupplierUserMaster/setBlockUnblock', { id, note });
  }

  setKYCVerify(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Supplier/setKYCVerify', { id });
  }

  assignKYCProfile(id: string, KycProfileId: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Supplier/assignKycProfile', { id: id, KycProfileId: KycProfileId });
  }



}
