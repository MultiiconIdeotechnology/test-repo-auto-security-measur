import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActivityTariffService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ActivityTariff/create', model);
  }

  delete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ActivityTariff/delete', { id: id });
  }

  setTariffPublish(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ActivityTariff/setActivityPublish', { id });
  }
}
