import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HotelBookingService {

  
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getHotelBookingList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Hotel/getHotelBookingList', model);
  }

  getHotelBookingRecord(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Hotel/getHotelBookingRecord', {id:id});
  }

  getHotelCityCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'HotelCity/getHotelCityCombo', { filter });
  }

}
