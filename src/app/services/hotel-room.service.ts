import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HotelRoomService {
  
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getHotelRoomsCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'HotelRooms/getHotelRoomsCombo', { filter });
  }

  getHotelRoomsList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'HotelRooms/getHotelRoomsList', model);
  }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'HotelRooms/create', model);
  }

  getHotelRoomsRecord(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'HotelRooms/getHotelRoomsRecord', { id: id });
  }

  delete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'HotelRooms/delete', { id: id });
  }
}
