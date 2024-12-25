import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InsuranceService {

    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getInsuranceBookingList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'InsuranceBooking/getInsuranceBookingList', model);
    }

    getInsuranceBookingRecord(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'InsuranceBooking/getInsuranceBookingRecord', { id: id });
    }

    printBooking(data: any) {
        return this.http.post<any>(environment.apiUrl + 'AirBooking/printBooking', data);
      }

    printInvoice(invoiceId: string): Observable<any> {
        return this.http.post<any>(environment.apiUrl + "AirBooking/printInvoice", { invoiceId: invoiceId });
    }

}
