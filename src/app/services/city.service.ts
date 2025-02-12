import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CityService {
    private baseUrl = environment.apiUrl;

    public cityListV2Subject = new BehaviorSubject<any[]>([]);
    cityListV2$ = this.cityListV2Subject.asObservable();
    cityListv2:any[] = [];

    constructor(private http: HttpClient) {}

    getCityCombo(filter: string): Observable<any[]> {
        return this.http.post<any[]>(this.baseUrl + 'city/getCityCombo', {
            filter,
        });
    }

    getCountryCombo(filter: string): Observable<any[]> {
        return this.http.post<any[]>(this.baseUrl + 'city/getCountryCombo', {
            filter,
        });
    }

    getStateCombo(country: string, filter: string): Observable<any[]> {
        return this.http.post<any[]>(this.baseUrl + 'city/getStateCombo', {
            country,
            filter,
        });
      }
      
    getCityList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'city/getCityList', model);
    }

    create(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'city/create', model);
    }

    getCityRecord(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'city/getCityRecord', {
            id: id,
        });
    }

    delete(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'city/delete', { id: id });
    }

    getMobileCodeCombo(filter?: string): Observable<any[]> {
       return this.http.post<any[]>(environment.apiUrl + 'city/getMobileCodeCombo', { filter });
    }

    setPreferedHotelEnable(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'city/setPreferedHotelEnable', { id: id });
    }

    getCityComboV2(data:any): Observable<any[]> {
        return this.http.post<any[]>(this.baseUrl + 'city/getCityListV2', data);
    }

    getCityListV2(data:any){
        this.getCityComboV2(data).subscribe((res:any) => {
          this.cityListV2Subject.next(res);
          this.cityListv2 = res;
        })
      }
}
