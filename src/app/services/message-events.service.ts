import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageEventsService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'MessageEvent/create', model);
  }

  getMessageEventRecord(): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'MessageEvent/getMessageEventRecord', {});
  }

  getMessageEventList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'MessageEvent/getMessageEventList', model);
  }

  delete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'MessageEvent/delete', { id: id });
  }
}