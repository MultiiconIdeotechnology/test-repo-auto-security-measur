import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CachingParameterService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    getCachingParametersList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'AirlineCachingPolicy/getAirlineCachingPolicyList', model);
    }

    create(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'AirlineCachingPolicy/create', model);
    }

    getCityRecord(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'city/getCityRecord', {
            id: id,
        });
    }

    delete(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'AirlineCachingPolicy/delete', { id: id });
    }
}
