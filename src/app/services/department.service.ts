import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getDepartmentCombo(): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'department/getDepartmentCombo', {});
  }

  getDepartmentList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'department/getDepartmentList', model);
  }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'department/create', model);
  }

  delete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'department/delete', { id: id });
  }


}
