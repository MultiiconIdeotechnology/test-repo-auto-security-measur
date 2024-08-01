import { items } from './../mock-api/apps/file-manager/data';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getItemMasterList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ItemMaster/getItemMasterList', model);
  }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ItemMaster/create', model);
  }

  delete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'ItemMaster/delete', { id: id });
  }

}