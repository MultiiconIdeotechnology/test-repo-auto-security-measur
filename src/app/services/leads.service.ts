import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeadsService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getLeadList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Agent/getLeadList', model);
  }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Agent/createLead', model);
  }

  leadConvert(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Agent/leadConvert', { id: id });
  }

  getAgentLeadList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AgentLead/getAgentLeadList', model);
  }

  getAgentLeadRecord(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AgentLead/getAgentLeadRecord', { id: id });
  }

  mapKycProfile(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Agent/mapKycProfile', model);
  }

  getAuthCityCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'auth/agent/getCityCombo', { filter });
  }

  getAuthMobileCodeCombo({ }): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'auth/agent/getMobileCodeCombo', {});
  }

  signUp(model: any): Observable<any> {
    return this.http.post(this.baseUrl + 'auth/agent/register', model);
}

}
