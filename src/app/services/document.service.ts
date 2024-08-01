import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  gettypesofdocumentsList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'typesofdocuments/gettypesofdocumentsList', model);
  }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'typesofdocuments/create', model);
  }

  gettypesofdocumentsRecord(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'typesofdocuments/gettypesofdocumentsRecord', { id: id });
  }

  delete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'typesofdocuments/delete', { id: id });
  }

  gettypesofdocumentsCombo(filter?: any): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'typesofdocuments/gettypesofdocumentsCombo', { filter });
  }

 
}
