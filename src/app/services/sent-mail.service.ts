import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SendMailService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSendEmailSmsList(model: any): Observable<any>{
    return this.http.post<any>(this.baseUrl + 'EmailSmsJobs/getSendEmailSmsList', model);
  }

  getSendEmailMsgBody(id: any): Observable<any>{
    return this.http.post<any>(this.baseUrl + 'EmailSmsJobs/getSendEmailMsgBody', {id: id});
  }
}
