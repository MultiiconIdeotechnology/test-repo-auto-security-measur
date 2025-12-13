import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HolidayLeadService {

  constructor(
    private http: HttpClient
  ) { }

  getHolidayLeads(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "holidayBookingLeads/getHolidayLeads", model);
  }

  setReadBySupplier(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "holidayBookingLeads/setReadBySupplier", {id:id});
  }

  setLeadStatus(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "holidayBookingLeads/setLeadStatus", model);
  }

  getHolidayBookingDetail(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "holidayBookingLeads/getHolidayBookingDetail", {id:id});
  }

  downloadQuotationV2(model): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "holidayBookingLeads/downloadQuotationV2", model);
  }

  getSupplierCombo(filter: string, type?: string): Observable<any[]> {
    return this.http.post<any[]>(environment.apiUrl + 'Supplier/getSupplierCombo', { filter: filter, type: type });
  }

    getSupplierBoCombo(type?: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "Supplier/getSupplierBoCombo", { type: type });
  }
}