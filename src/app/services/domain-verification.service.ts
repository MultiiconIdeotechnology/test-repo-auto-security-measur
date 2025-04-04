import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, Subject, take } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DomainVerificationService {
    private baseUrl = environment.apiUrl;

    createUpdateDomainSubject = new BehaviorSubject<any>("");
    createUpdateDomain$ = this.createUpdateDomainSubject.asObservable();

    verifyButtonSubject  = new Subject<boolean>();
    verifyButton$ = this.verifyButtonSubject.asObservable();

    constructor(private http: HttpClient) { }

    create(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'DomainConfiguration/create', model);
    }

    createMobileDomain(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'DomainConfiguration/androidIOSConfiguration', model);
    }

    pingAndBind(wl_id: string, product_id: string) {
        const params = new HttpParams()
          .set('wl_id', wl_id)
          .set('product_id', product_id);
      
        return this.http.post(`${this.baseUrl}DomainConfiguration/pingAndBind?${params.toString()}`, {});
    }

    generateSSl(wl_id: string, product_id: string) {
        const params = new HttpParams()
          .set('wl_id', wl_id)
          .set('product_id', product_id);
      
        return this.http.post(`${this.baseUrl}SSL/generate-install?${params.toString()}`, {});
    }

    getWLSettingList(agentId: any): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}Dashboard/TecDashboard/GetWlSetting?agent_id=${agentId}`);
    }
      
 
}
