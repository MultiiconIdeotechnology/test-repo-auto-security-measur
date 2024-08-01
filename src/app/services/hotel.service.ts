import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HotelService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getHotelCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'Hotel/getHotelCombo', { filter });
  }

  getHotelComboCityWise(ids: string[]): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'Hotel/getHotelComboCityWise', { ids });
  }

  getHotelList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Hotel/getHotelList', model);
  }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Hotel/create', model);
  }

  getHotelRecord(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Hotel/getHotelRecord', { id: id });
  }

  getHotelDetail(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Hotel/getHotelDetail', { id: id });
  }

  delete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Hotel/delete', { id: id });
  }

}
