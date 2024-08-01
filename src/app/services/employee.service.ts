import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getEmployeeList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employee/getEmployeeList', model);
  }

  getemployeeRecord(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employee/getemployeeRecord', { id });
  }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employee/create', model);
  }

  setWrokingProfile(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employee/setWrokingProfile', model);
  }

  delete(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employee/delete', { id });
  }

  setBlockUnblock(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employee/setBlockUnblock', { id });
  }

  setKycAudit(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employee/kycAudit', { id });
  }

  getemployeeCombo(filter: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employee/getemployeeCombo', { filter });
  } 
  
  getEmployeeLeadAssignCombo(filter: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employee/getEmployeeLeadAssignCombo', { filter });
  }

  getAgentCombo(filter: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Agent/getAgentCombo', { filter });
  }

  mapPermissionProfile(id: string, PermissionProfileId: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employee/mapPermissionProfile', { id: id, PermissionProfileId: PermissionProfileId });
  }

  mapkycProfile(id: string, KycProfileId: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'employee/mapKycProfile', { id: id, KycProfileId: KycProfileId });
  }

  getSupplierCombo(filter: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Supplier/getSupplierCombo', { filter });
  }

  regenerateNewPassword(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Employee/regenerateNewPassword', { id: id });
  }

  ChangePassword(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'Employee/ChangePassword', model);
  } 
  
  setPassword(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'employee/setPassword', model);
  }


}
