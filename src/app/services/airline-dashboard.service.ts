import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, of, tap } from 'rxjs';


export interface FlightRecord {
    key: string;
    dateTime: number;  // Store timestamp as a number (milliseconds since epoch)
    resultIndex: any;
    returnId: any;
}

@Injectable({
    providedIn: 'root',
})

export class AirlineDashboardService {
    private baseUrl = environment.apiUrl;
    private fareCache = new Map<string, any>(); // Cache Map

    constructor(private http: HttpClient) { }

    getAirportMstCombo(SearchFor: string, From: string = '', To: string = ''): Observable<any[]> {
        return this.http.post<any[]>(environment.apiUrl + "AirportMst/getAirportMstCombo", { SearchFor, From, To });
    }

    getDateWiseFares(from: string, to: string, type: string): Observable<any> {
        const key = `${from}-${to}-${type}`; // Unique key for the sector

        // ✅ If data exists in cache, return cached data instead of API call
        if (this.fareCache.has(key)) {
            return of(this.fareCache.get(key));
        }

        // ✅ If no cache, make API call and store the result in the cache
        return this.http.get<any[]>(`${environment.apiUrl}Flight/getDateWiseFares?from=${from}&to=${to}`)
            .pipe(
                tap(response => {
                    this.fareCache.set(key, response); // Store response in cache
                })
            );

    }

    fareRules(model: any): Observable<any> {
        return this.http.post<any>(environment.apiUrl + "Flight/fareRules", model);
    }

    generateUniqueKey(): string {
        let random = Math.floor(Math.random() * 900) + 100;
        return random + '-' + Date.now();
    }

    getStoredRecords(): FlightRecord[] {
        const storedData = localStorage.getItem('flightIndexs');
        return storedData ? JSON.parse(storedData) : [];
    }

    addFlightRecord(key: any, resultIndex: any, returnId?: any): void {
        const records: FlightRecord[] = this.getStoredRecords();

        const newRecord: FlightRecord = {
            key: key,
            dateTime: Date.now(),
            resultIndex: resultIndex,
            returnId: returnId || ''
        };

        records.push(newRecord);
        this.cleanOldRecords(records); // Remove records older than 2 hours
    }

    cleanOldRecords(records: FlightRecord[]): void {
        const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
        const filteredRecords = records.filter(record => record.dateTime > twoHoursAgo);
        // Update localStorage with the filtered records
        localStorage.setItem('flightIndexs', JSON.stringify(filteredRecords));
    }

    flightSearch(model: any): Observable<any> {
        return this.http.post<any>(environment.apiUrl + "Flight/flightSearch", model);
    }

    getActualMarkupROE(model: any): Observable<any> {
        return this.http.post<any>(environment.apiUrl + 'currency/getActualMarkupROE', model);
    }

    getConvertCurrencyCombo(): Observable<any[]> {
        return this.http.post<any[]>(environment.apiUrl + 'currency/getConvertCurrencyCombo', {});
    }
}
