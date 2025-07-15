import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonFareTypeService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }


  getcommonFareTypeList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'CommonFareType/getCommonFareTypeList', model);
  }

  getCommonFareTypeCombo(filter: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'CommonFareType/getCommonFareTypeCombo', { filter });
  }

  
  createCommonFareType(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'CommonFareType/create', model);
  }

   delete(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'CommonFareType/delete', {id: id});
  }

}
