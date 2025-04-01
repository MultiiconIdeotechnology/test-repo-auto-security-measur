import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, take } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DomainVerificationService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    create(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'DomainConfiguration/create', model);
    }
 
}
