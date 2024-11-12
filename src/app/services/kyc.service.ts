import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class KycService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getkycprofileCombo(Particular: string): Observable<any[]> {
        return this.http.post<any[]>(
            this.baseUrl + 'kycprofile/getkycprofileCombo',
            { Particular }
        );
    }

    getkycprofileList(model: any): Observable<any> {
        return this.http.post<any>(
            this.baseUrl + 'kycprofile/getkycprofileList',
            model
        );
    }

    create(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'kycprofile/create', model);
    }

    getkycprofileRecord(id: any): Observable<any> {
        return this.http.post<any>(
            this.baseUrl + 'kycprofile/getkycprofileRecord',
            { id: id }
        );
    }

    delete(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'kycprofile/delete', {
            id: id,
        });
    }

    setDefault(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'kycprofile/setDefault', { id: id });
    }

    documentdelete(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'kycprofiledocuments/delete', { id: id });
    }

    documentsCreate(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'kycprofiledocuments/create', model);
    }

    kycProfileCopy(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'kycprofile/kycProfileCopy', { id: id });
    }

    getSupplierKycList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Supplier/getSupplierKycList', model);
    }
}
