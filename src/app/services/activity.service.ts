 import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getActivityCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'Activity/getActivityCombo', { filter });
  }

  getProductActivityCombo(ids: string[]): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'Activity/getProductActivityCombo', { ids });
  }

  enableDisableSighseeingCombo(id: string): Observable<any> {
    return this.http.post<any[]>(this.baseUrl + 'Activity/enableDisableSighseeingCombo', { id });
  }

  getActivityList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Activity/getActivityList', model);
  }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Activity/create', model);
  }

  getActivityRecord(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Activity/getActivityRecord', { id: id });
  }

  delete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Activity/delete', { id: id });
  }

  setAuditUnaudit(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Activity/setAuditUnaudit', { id });
  }

  setEnableDisable(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Activity/setEnableDisable', { id });
  }

  createSubActivity(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ComboSubActivity/create', model);
  }

  deleteSubActivity(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ComboSubActivity/delete', { id: id });
  }
}
