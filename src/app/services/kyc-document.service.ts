import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KycDocumentService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getdocumentList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'document/getdocumentList', model);
  }

  create(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'document/create', model);
  }

  getdocumentRecord(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'document/getdocumentRecord', model);
  }

  getdocumentDetail(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'document/getdocumentDetail', { id: id });
  }

  getemployeedocumentRecord(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'document/getdocumentRecord', { id: id,for:'employee' });
  }

  delete(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'document/delete', { id: id });
  }

  getAgentCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'Agent/getAgentCombo', { filter });
  }
  
  getSupplierCombo(filter: string, type?: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'Supplier/getSupplierCombo', { filter: filter, type : type });
  }

  getkycprofileCombo(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'kycprofile/getkycprofileCombo', { id: id });
  }

  getkycprofiledocumentsCombo(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'kycprofiledocuments/getkycprofiledocumentsCombo', { id: id });
  }

  getKYCDisplay(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'document/getKYCDisplay', { id: id });
  }

  verify(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'document/verify', model);
  }

  reject(id: any, note?:string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'document/reject', { id:id, note:note });
  }

  getDocumentTypeCombo(filter: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'document/getDocumentTypeCombo', {
        filter,
    });
  }

  

}