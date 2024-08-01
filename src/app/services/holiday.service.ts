import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HolidayService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getHolidayProductCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'HolidayProduct/getHolidayProductCombo', { filter: filter, is_active: true });
  }

  getHolidayProductList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'HolidayProduct/getHolidayProductList', model);
  }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'HolidayProduct/create', model);
  }

  createCity(model: any[]): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductCities/create', model);
  }

  createInclusion(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductInclusions/create', model);
  }

  createExclusion(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductExclusions/create', model);
  }

  addDefaultExclusions(product_id: string, exclusions: string[]): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductExclusions/addDefaultExclusions', { product_id, exclusions });
  }

  createItenrary(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductItinerary/create', model);
  }

  createNotes(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductSpecialNotes/create', model);
  }

  getHolidayProductRecord(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'HolidayProduct/getHolidayProductRecord', { id: id });
  }

  delete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'HolidayProduct/delete', { id: id });
  }

  CopyProduct(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'HolidayProduct/CopyProduct', { id: id });
  }

  deleteCity(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductCities/delete', { id: id });
  }

  deleteInclusion(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductInclusions/delete', { id: id });
  }

  deleteExclusion(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductExclusions/delete', { id: id });
  }

  deleteNotes(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductSpecialNotes/delete', { id: id });
  }

  setHolidayPublish(id: string, publish_for: string = 'Global'): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'HolidayProduct/setHolidayPublish', { id, publish_for });
  }

  setHolidayPopular(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'HolidayProduct/setPopular', { id });
  }

  getHolidayProductDetails(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'HolidayProduct/getHolidayProductDetails', { id });
  }

  pasteInclusionItems(model: {}): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductInclusions/pasteInclusionItems', model);
  }

  holidayThemeCombo(): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'holidayProduct/getHolidayThemeCombo', { });
  }

  getHolidaysSearchDetail(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "HolidayProduct/getHolidaysSearchDetail", model);
  }

  downloadQuotation(model: any): Observable<any[]> {
    return this.http.post<any[]>(environment.apiUrl + 'HolidayLeads/downloadQuotation', model);
  }
}
