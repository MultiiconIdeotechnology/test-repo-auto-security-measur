import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HotelTariffService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getHotelTariffCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'HotelTariff/getHotelTariffCombo', { filter });
  }

  getHotelTariffList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'HotelTariff/getHotelTariffList', model);
  }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'HotelTariff/create', model);
  }

  getHotelTariffRecord(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'HotelTariff/getHotelTariffRecord', { id: id });
  }

  delete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'HotelTariff/delete', { id: id });
  }

  setPublish(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'HotelTariff/setPublish', { id: id });
  }
}
