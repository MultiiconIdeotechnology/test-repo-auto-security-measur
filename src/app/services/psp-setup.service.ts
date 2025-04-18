import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PspSetupService {
  private baseUrl = environment.apiUrl;

  managePgProfileSubject = new BehaviorSubject<any>("");
  managePgProfile$ = this.managePgProfileSubject.asObservable();

  editPgProfileSubject = new BehaviorSubject<any>("");
  editPgProfile$ = this.managePgProfileSubject.asObservable();



  constructor(private http: HttpClient) { }

  getPaymentGatewaySettingsList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'PaymentGatewaySettings/pgProfiles', model);
  }

  getAgentProfileFromId(id:string){
    return this.http.post<any>(this.baseUrl + 'PaymentGatewaySettings/pgProfile', {id: id});
  }

  managePgProfile(model:any){
    return this.http.post<any>(this.baseUrl + 'PaymentGatewaySettings/managePGProfile', model);
  }

  managePGSettings(model:any){
    return this.http.post<any>(this.baseUrl + 'PaymentGatewaySettings/managePGSettings ', model);
  }

  delete(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'PaymentGatewaySettings/deletePGProfile', {id: id});
  }

  setEnableStatus(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'PaymentGatewaySettings/setEnableStatus', {id: id});
  }
  
  setDefaultStatus(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'PaymentGatewaySettings/setDefaultStatus', {id: id});
  }

  deletePgSettings(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'PaymentGatewaySettings/deletePGSettings', {id: id});
  }





  getPaymentModes(model:any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'PaymentGateway/getPaymentModes', model);
  }

  getPaymentGatewayTypes({}): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'PaymentGateway/getPaymentGatewayTypes', {});
  }

  // getAgentCombo(filter:string, is_master_agent:boolean): Observable<any> {
  //   return this.http.post<any>(this.baseUrl + 'Agent/getAgentCombo', {filter:filter, is_master_agent:is_master_agent});
  // }
  
  // getCompanyCombo(filter:string): Observable<any> {
  //   return this.http.post<any>(this.baseUrl + 'Company/getCompanyCombo', {filter});
  // }

}
