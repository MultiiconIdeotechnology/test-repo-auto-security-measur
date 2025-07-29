import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupplierInventoryProfileService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAirlineCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'Airline/getAirlineCombo', { filter });
  }


  getSupplierComboOfflinePNR(filter: string, type: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Supplier/getSupplierCombo', { filter, type });
  }

  getAirportMstCombo(filter: string): Observable<any[]> {
    return this.http.post<any>(this.baseUrl + 'AirportMst/getAirportMstCombo', { filter });
  }

  // getSupplierFareTypeCombo(supplier_id: string, filter?: string): Observable<any[]> {
  //   return this.http.post<any[]>(this.baseUrl + 'SupplierFareTypeMapper/getSupplierFareTypeCombo', {
  //     supplier_id: supplier_id,
  //     filter: filter,
  //   });
  // }
  
  getSupplierFareTypeCombo(supplier_id: string, filter?: string, is_active: boolean = true): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'SupplierFareTypeMapper/getSupplierFareTypeCombo', {
      supplier_id: supplier_id,
      filter: filter,
      is_active: is_active
    });
  }

  getFareypeSupplierBoCombo(type?: string, filter?: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + "Supplier/getSupplierBoCombo", { type: type, filter });
  }


  createSupplierInventoryProfile(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'SupplierInventoryProfile/create', model);
  }

  getSupplierInventoryProfileList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'SupplierInventoryProfile/getSupplierInventoryProfileList', model);
  }


  getSupplierInventoryProfileRecord(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'SupplierInventoryProfile/getSupplierInventoryProfileRecord', { id: id });
  }

  deleteSupplierInventoryProfileRecord(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'SupplierInventoryProfile/delete', { id: id });
  }
}
