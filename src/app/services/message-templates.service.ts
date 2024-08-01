import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageTemplatesService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMessageList(model: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'Message/getMessageList', model);
  }

  create(model: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'Message/create', model);
  }

  getMessageRecord(id: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'Message/getMessageRecord', { id: id });
  }

  delete(id: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'Message/delete', { id: id });
  }

  getMessageEventCombo(filter: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'MessageEvent/getMessageEventCombo', { filter });
  }

  getEmailSetupCombo(filter: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'EmailSetup/getEmailSetupCombo', { filter });
  }
  
  setEnableDisable(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Message/setEnable', { id });
  }
}