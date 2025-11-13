import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KycDashboardService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAgentLeadKycList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AgentLead/getAgentLeadKycList', model);
  }

  leadConvert(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AgentLead/leadConvert', model);
  }

}
