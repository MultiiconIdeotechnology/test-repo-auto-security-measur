import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailSetupService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getEmailSetupList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'EmailSetup/getEmailSetupList', model);
  }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'EmailSetup/create', model);
  }

  getEmailSetupRecord(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'EmailSetup/getEmailSetupRecord', { id: id });
  }

  delete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'EmailSetup/delete', { id: id });
  }

  setDefault(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'EmailSetup/setDefault', { id: id });
  }

  sendTestMail(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'EmailSetup/sendTestMail', model);
  }

}
