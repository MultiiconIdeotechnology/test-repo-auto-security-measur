import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PgRefundService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPGRefundReport(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "AccountReport/getPGRefundReport", model);
  }

}
