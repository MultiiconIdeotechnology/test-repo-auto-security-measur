import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getVehicleCombo(filter: string): Observable<any[]> {
      return this.http.post<any[]>(this.baseUrl + 'Vehicle/getVehicleCombo', { filter });
  }

  getVehicleList(model: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'Vehicle/getVehicleList', model);
  }

  create(model: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'Vehicle/create', model);
  }

  getVehicleRecord(id: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'Vehicle/getVehicleRecord', { id: id });
  }

  delete(id: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'Vehicle/delete', { id: id });
  }

  setAuditUnaudit(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Vehicle/setAuditUnaudit', { id });
  }

  setEnableDisable(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Vehicle/setEnableDisable', { id });
  }
}
