import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPermissionCombo(filter: string): Observable<any[]> {
      return this.http.post<any[]>(this.baseUrl + 'Permission/getPermissionCombo', { filter });
  }

  getPermissionList(model: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'Permission/getPermissionList', model);
  }

  create(model: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'Permission/create', model);
  }

  getPermissionRecord(id: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'Permission/getPermissionRecord', { id: id });
  }

  getAllPermission(): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'Permission/getAllPermission', {});
  }

  delete(id: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'Permission/delete', { id: id });
  }

  setDefault(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Permission/setDefault', { id: id });
  }
}
