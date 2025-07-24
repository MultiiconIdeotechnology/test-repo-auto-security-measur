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
}
