import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class CabService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // getCabProductRecord(id: any): Observable<any> {
  //   return this.http.post<any>(this.baseUrl + 'cab/getCabProductRecord', { id: id });
  // }

  getCabList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'cab/getCabList', model);
  }

  delete(id: any): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'cab/delete', { id: id });
  }

  setAuditUnaudit(id: any) {
    return this.http.post<any[]>(this.baseUrl + 'cab/setAuditUnaudit', { id: id });
  }

  CopyProduct(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'HolidayProduct/CopyProduct', { id: id });
  }

  // //----
  // setCabPopular(id: string): Observable<any> {
  //   return this.http.post<any[]>(this.baseUrl + 'cab/setPopular', { id: id });
  // } // ---

  setCabPublish(id: any): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'cab/setPublishUnPublishBonton', { id: id });
  }

  getCabDetails(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "cab/getCabDetail", model);
  } 

  downloadQuotation(model: any): Observable<any[]> {
    return this.http.post<any[]>(environment.apiUrl + 'HolidayLeads/downloadQuotation', model);
  }

  getCabLeadsList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + "cableads/getCabLeadsList", model);
  }

  getCabBookingDetail(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "cableads/getCabBookingDetail", { id: id });
  }
}
