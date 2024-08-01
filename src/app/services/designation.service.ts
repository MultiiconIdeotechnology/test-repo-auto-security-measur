import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DesignationService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getDesignationCombo(): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'designation/getDesignationCombo', {});
  }

  getDesignationList(model): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'designation/getDesignationList', model);
  }

  create(model): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'designation/create', model);
  }

  getDesignationRecord(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'designation/getDesignationRecord', { id });
  }

  delete(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'designation/delete', { id });
  }
}
