import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductFixDepartureService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getProductFixDepartureCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'ProductFixDeparture/getProductFixDepartureCombo', { filter });
  }

  getAirlineCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'Airline/getAirlineCombo', { filter });
  }

  getAirportMstCombo(filter: string, city?: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'AirportMst/getAirportMstCombo', { filter: filter, city: city });
  }

  getProductFixDepartureList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductFixDeparture/getProductFixDepartureList', model);
  }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductFixDeparture/create', model);
  }

  Imagecreate(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Image/create', model);
  }

  createMultiple(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Image/createMultiple', model);
  }

  Imagedelete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Image/delete', { id: id });
  }

  ProductFlightDetailscreate(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductFlightDetails/create', model);
  }

  ProductFlightDetailsdelete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductFlightDetails/delete', { id: id });
  }

  getProductFixDepartureRecord(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductFixDeparture/getProductFixDepartureRecord', { id: id });
  }

  delete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductFixDeparture/delete', { id: id });
  }

  getVisaDestinationCombo({}): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'Visa/getVisaDestinationCombo', {  });
  }
}
