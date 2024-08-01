import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DestinationCitiesService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getDestinationCityCombo(id: string): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'destinationcity/getDestinationCityCombo', { id });
  }
}
