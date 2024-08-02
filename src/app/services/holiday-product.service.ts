import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HolidayProductService {

  constructor(
    private http: HttpClient
  ) { }

  create(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'HolidayProduct/create', model)
  }

  getDestinationCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(environment.apiUrl + 'Destination/getDestinationComboForCreate', { filter });
  }

  getHolidayAgentProductDetails(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'HolidayProduct/getHolidayAgentProductDetails', { id });
  }

  createProductFixDeparture(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'ProductFixDeparture/create', model);
  }

  deleteProductFixDeparture(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'ProductFixDeparture/delete', { id });
  }

  createProductCities(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'ProductCities/create', model);
  }

  deleteProductCities(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'ProductCities/delete', { id });
  }

  createProductInclusions(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'ProductInclusions/create', model)
  }

  deleteProductInclusions(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'ProductInclusions/delete', { id })
  }

  createProductExclusions(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'ProductExclusions/create', model)
  }

  deleteProductExclusions(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'ProductExclusions/delete', { id })
  }

  createProductItinerary(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'ProductItinerary/create', model)
  }

  deleteProductItinerary(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'ProductItinerary/delete', { id })
  }

  createProductPricing(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'ProductPricing/create', model)
  }

  deleteProductPricing(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'ProductPricing/delete', { id })
  }

  createProductSpecialNotes(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'ProductSpecialNotes/create', model)
  }

  deleteProductSpecialNotes(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'ProductSpecialNotes/delete', { id })
  }

  createProductFlightDetails(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'ProductFlightDetails/create', model)
  }

  deleteProductFlightDetails(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'ProductFlightDetails/delete', { id })
  }

  getHolidayProductList(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'HolidayProduct/getHolidayProductList', model)
  }

  getDestinationCityCombo(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'DestinationCity/getDestinationCityCombo', { id })
  }

  getRoomCategoryCombo(): Observable<any[]> {
    return this.http.post<any>(environment.apiUrl + 'ProductInclusions/getRoomCategoryCombo', {})
  }
}
