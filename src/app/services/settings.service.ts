import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  create(model: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'ErpSettings/create', model);
  }

  getErpSettingsRecord(): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'ErpSettings/getErpSettingsRecord', {});
  }

  getCompanyCombo(model:any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Company/getCompanyCombo', model);
}

  

}