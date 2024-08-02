import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DestinationService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    getdestinationCombo(filter: string): Observable<any[]> {
        return this.http.post<any[]>(
            this.baseUrl + 'destination/getDestinationComboForCreate',
            { filter }
        );
    }

    getdestinationList(model: any): Observable<any> {
        return this.http.post<any>(
            this.baseUrl + 'destination/getdestinationList',
            model
        );
    }

    create(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'destination/create', model);
    }

    getdestinationRecord(id: any): Observable<any> {
        return this.http.post<any>(
            this.baseUrl + 'destination/getdestinationRecord',
            { id: id }
        );
    }

    delete(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'destination/delete', {
            id: id,
        });
    }

    getDefaultExclusions(id: string): Observable<any[]> {
        return this.http.post<any[]>(
            this.baseUrl + 'destination/getDefaultExclusions',
            { id }
        );
    }

    setEnableDisable(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'destination/setEnable', {
            id,
        });
    }

    createDestinationCity(model: any): Observable<any> {
        return this.http.post<any>(
            this.baseUrl + 'DestinationCity/create',
            model
        );
    }
  

    deleteDestinationCity(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'DestinationCity/delete', {
            id: id,
        });
    }

    createProductExclusion(model: any): Observable<any> {
        return this.http.post<any>(
            this.baseUrl + 'DefaultProductExclusions/create',
            model
        );
    }

    deleteProductExclusion(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'DefaultProductExclusions/delete', {
            id: id,
        });
    }
}
