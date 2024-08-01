import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupInquiryService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAirGroupInquiryList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AirGroupInquiry/getAirGroupInquiryList', model);
  }

  groupInquiryUpdateCharges(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AirGroupInquiry/groupInquiryUpdateCharges', model);
  }

  getGroupInquiryRecord(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AirGroupInquiry/getGroupInquiryRecord', { id: id });
  }

  setBookingStatus(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AirGroupInquiry/setBookingStatus', model);
  }

  // setBookingStatus(id: string): Observable<any> {
  //   return this.http.post<any>(this.baseUrl + 'AirGroupInquiry/setBookingStatus', { id: id });
  // }

}
