import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupplierApiService {

  
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getSupplierWiseApiList(model): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'SupplierWiseApi/getSupplierWiseApiList', model);
  }

  getSupplierWiseApiRecord(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'SupplierWiseApi/getSupplierWiseApiRecord', { id });
  }

  delete(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'SupplierWiseApi/delete', { id });
  }

  create(model): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'SupplierWiseApi/create', model);
  }

  setEnableDisable(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'SupplierWiseApi/setEnableDisable', { id });
  }

}
