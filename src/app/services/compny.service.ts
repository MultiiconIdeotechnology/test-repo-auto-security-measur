import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompnyService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCityCombo(filter: string): Observable<any[]> {
      return this.http.post<any[]>(this.baseUrl + 'city/getCityCombo', { filter, });
  }

  getCompanyList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Company/getCompanyList', model);
  }

  create(model: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'Company/create', model);
  }

  getCompanyRecord(id: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'Company/getCompanyRecord', { id: id, });
  }

  delete(id: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'Company/delete', { id: id });
  }


}
