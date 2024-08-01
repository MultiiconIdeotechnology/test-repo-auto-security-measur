import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AmendmentRequestsService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAirAmendmentList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AirAmendment/getAirAmendmentList', model);
  }

  initialAmendmentCharges(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AirAmendment/initialAmendmentCharges', { id: id });
  }

  amendmentCharges(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AirAmendment/amendmentCharges', model);
  }

  amendmentChargesDeduction(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AirAmendment/amendmentChargesDeduction', model);
  }

  setAmendmentStatusQ(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + "AirAmendment/setAmendmentStatus", model);
  }

  setAmendmentStatus(id: string, status: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AirAmendment/setAmendmentStatus', { id, status });
  }
  
  getAirAmendmentRecord(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AirAmendment/getAirAmendmentRecord', {id:id});
  }

  getAmendmentStatusLog(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AirAmendment/getAmendmentStatusLog', {id:id});
  }

  completeAmendment(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AirAmendment/completeAmendment', {id:id});
  }

  SendAmendmentEmailToSupplier(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AirAmendment/SendAmendmentEmailToSupplier', {id:id});
  }

}
