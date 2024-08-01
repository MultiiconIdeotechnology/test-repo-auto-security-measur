import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PermissionProfileService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPermissionProfileCombo(Particular: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'PermissionProfile/getPermissionProfileCombo', { Particular });
  }

  getPermissionProfileList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'PermissionProfile/getPermissionProfileList', model);
  }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'PermissionProfile/create', model);
  }

  createPermission(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'UserPermissions/create', model);
  }

  getPermissionProfileRecord(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'PermissionProfile/getPermissionProfileRecord', { id: id });
  }

  delete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'PermissionProfile/delete', { id: id });
  }

  getPermissionListByPermissionProfile(id: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'permissionprofile/getPermissionListByPermissionProfile', { id: id });
  }

  setDefault(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'PermissionProfile/setDefault', { id: id });
  }
}
