import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductPricingService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getProductPricingCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'ProductPricing/getProductPricingCombo', { filter });
  }

  getProductPricingList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductPricing/getProductPricingList', model);
  }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductPricing/create', model);
  }

  getProductPricingRecord(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductPricing/getProductPricingRecord', { id: id });
  }

  setPublish(id: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'ProductPricing/setPublish', { id: id });
  }

  delete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ProductPricing/delete', { id: id });
  }
}
