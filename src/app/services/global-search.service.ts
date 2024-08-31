import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GlobalSearchService {
    constructor(private http: HttpClient) { }
    private baseUrl = environment.apiUrl;

    getInputDetails(query: any): Observable<any> {
        return this.http.post<any[]>(`${this.baseUrl}GlobalSearch/getValuesGlobleSearch`, query);
    }
}
