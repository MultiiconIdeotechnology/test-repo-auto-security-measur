import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarkupprofileService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMarkupProfileList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'MarkupProfile/getMarkupProfileList', model);
  }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'MarkupProfile/create', model);
  }

  getMarkupProfileRecord(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'MarkupProfile/getMarkupProfileRecord', { id: id });
  }

  delete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'MarkupProfile/delete', { id: id });
  }

  setDefault(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'MarkupProfile/setDefault', { id: id });
  }

  getMarkupProfileCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'MarkupProfile/getMarkupProfileCombo', { filter });
  }

  getMarkup(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'MarkupProfile/getMarkup', { id: id });
  }

  getMarkupDetailsRecord(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'MarkupDetails/getMarkupDetailsRecord', { id: id });
  }

  detailDelete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'MarkupDetails/delete', { id: id });
  }

  detailCreate(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'MarkupDetails/create', model);
  }

  airGroupInquiryCreate(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'MarkupDetails/airlineGroupMarkup', model);
  }

  airDelete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AirlineWiseMarkup/delete', { id: id });
  }

  airCreate(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AirlineWiseMarkup/create', model);
  }

  destinationDelete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'DestinationWiseMarkup/delete', { id: id });
  }

  destinationCreate(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'DestinationWiseMarkup/create', model);
  }

  visaDelete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'VisaCountryWiseMarkup/delete', { id: id });
  }

  visaCreate(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'VisaCountryWiseMarkup/create', model);
  }

  supplierCreate(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'SupplierWiseMarkup/create', model);
  }

  getMarkupDetailsDefaultRecord(): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'MarkupDetails/getMarkupDetailsDefaultRecord', {});
  }

  supplierDelete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'SupplierWiseMarkup/delete', { id: id });
  }
}
