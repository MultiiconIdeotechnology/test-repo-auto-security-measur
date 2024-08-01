import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WlService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getWlCombo(filter: string): Observable<any[]> {
      return this.http.post<any[]>(this.baseUrl + 'Wl/getWlCombo', { filter });
  }

  getWlList(model: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'Wl/getWlList', model);
  }

  create(model: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'Wl/create', model);
  }

  getWlRecord(id: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'Wl/getWlRecord', { id: id });
  }

  delete(id: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'Wl/delete', { id: id });
  }

  setEnableDisable(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'wl/setEnableDisable', { id });
  }

  getAgentCombo(filter: string, is_master_agent: boolean): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + "Agent/getAgentCombo", { filter, is_master_agent });
  }
}
