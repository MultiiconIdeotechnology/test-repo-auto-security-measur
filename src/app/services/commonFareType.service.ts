import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonFareTypeService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }


  //common Tab 
  getcommonFareTypeList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'CommonFareType/getCommonFareTypeList', model);
  }

  getCommonFareTypeCombo(filter: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'CommonFareType/getCommonFareTypeCombo', { filter });
  }


  createCommonFareType(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'CommonFareType/create', model);
  }

  delete(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'CommonFareType/delete', { id: id });
  }

  //Supplier Tab  
  getSupplierFareTypeMapperList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'SupplierFareTypeMapper/getSupplierFareTypeMapperList', model);
  }

  createSupplierFareTypeMapper(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'SupplierFareTypeMapper/create', model);
  }

  deleteSupplierFareTypeMapper(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'SupplierFareTypeMapper/delete', { id: id });
  }

  getSupplierFareTypeCombo(supplier_id: string, filter?: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'SupplierFareTypeMapper/getSupplierFareTypeCombo', {
      supplier_id: supplier_id,
      filter: filter,
    });
  }


  getFareypeSupplierBoCombo(type?: string, filter?: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + "Supplier/getSupplierBoCombo", { type: type, filter });
  }

  // getSupplierFareTypeMapperCombo(filter?: string): Observable<any[]> {
  //   return this.http.post<any[]>(this.baseUrl + 'SupplierFareTypeMapper/getSupplierFareTypeMapperCombo', { filter });
  // }

}
