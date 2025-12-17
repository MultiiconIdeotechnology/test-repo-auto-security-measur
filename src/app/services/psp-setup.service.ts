import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, BehaviorSubject, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PspSetupService {
  private baseUrl = environment.apiUrl;

  managePgProfileSubject = new BehaviorSubject<any>("");
  managePgProfile$ = this.managePgProfileSubject.asObservable();

  editPgProfileSubject = new BehaviorSubject<any>("");
  editPgProfile$ = this.editPgProfileSubject.asObservable();

  private pspListData: any = null;
  private companyList:any = null;

  constructor(private http: HttpClient) { }

  getPaymentGatewaySettingsList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'PaymentGatewaySettings/pgProfiles', model);
  }

  getAgentProfileFromId(id:string){
    return this.http.post<any>(this.baseUrl + 'PaymentGatewaySettings/pgProfileAgents', {id: id});
  }

  getPgProfileFromId(id:string){
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

  getPaymentGatewayCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'PaymentGateway/getPaymentGatewayCombo', { filter });
  }

  getPaymentGatewayListCached(filter:string): Observable<any> {
    if (this.pspListData) {
      return of(this.pspListData); // return cached
    } else {
      return this.http.post<any[]>(this.baseUrl + 'PaymentGateway/getPaymentGatewayCombo', { filter }).pipe(
        tap((res) => this.pspListData = res)
      );
    }
  }

   getPgCombo(model): Observable<any> {
    return this.http.post<any[]>(this.baseUrl + 'PaymentGateway/getPGCombo', model);
  }

  getCompanyComboCashed(filter:string):Observable<any> {
     if (this.companyList) {
      return of(this.companyList); // return cached
    } else {
      return this.http.post<any[]>(this.baseUrl + 'Company/getCompanyCombo', { filter }).pipe(
        tap((res) => this.companyList = res)
      );
    }
  }

   getAgentCombo(filter:string, is_master_agent:boolean): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/getAgentCombo', {filter:filter, is_master_agent:is_master_agent});
      }

  assignPgProfile(model:any){
    return this.http.post<any>(this.baseUrl + 'PaymentGatewaySettings/assignPGProfile', model);
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


  setEnableDisablePGSettings(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'PaymentGatewaySettings/setEnableDisablePGSettings', { id: id });
  }
}
