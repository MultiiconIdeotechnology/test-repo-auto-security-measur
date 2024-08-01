import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBusBookingList(model: any): Observable<any>{
    return this.http.post<any>(this.baseUrl + 'BusBooking/getBusBookingList', model);
  }

  getBusBookingRecord(id: any): Observable<any>{
    return this.http.post<any>(this.baseUrl + 'BusBooking/getBusBookingRecord', {id: id});
  }

  getBusCityCombo(filter?: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'BusCity/getBusCityCombo', { filter });
  }
}
