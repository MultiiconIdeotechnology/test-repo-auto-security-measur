import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransferService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getTransferActivityCombo(filter: string, clientId?: string): Observable<any[]> {
      return this.http.post<any[]>(this.baseUrl + 'TransferActivity/getTransferActivityCombo', { filter, clientId });
  }

  getProductTransferActivityCombo(ids: string[]): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'TransferActivity/getProductTransferActivityCombo', { ids });
}

  getTransferActivityList(model: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'TransferActivity/getTransferActivityList', model);
  }

  create(model: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'TransferActivity/create', model);
  }

  getTransferActivityRecord(id: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'TransferActivity/getTransferActivityRecord', { id: id });
  }

  delete(id: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'TransferActivity/delete', { id: id });
  }

  setAuditUnaudit(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'TransferActivity/setAuditUnaudit', { id });
  }

  setEnableDisable(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'TransferActivity/setEnableDisable', { id });
  }
}
