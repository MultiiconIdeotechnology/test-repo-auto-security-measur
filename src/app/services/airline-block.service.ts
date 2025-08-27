import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';


@Injectable({
    providedIn: 'root',
})
export class AirlineBlockService {

    private airlineBlockDataSubject = new BehaviorSubject<any>(null);
    airlineBlockData$ = this.airlineBlockDataSubject.asObservable();
    air_block_id: any = "";
    user: any = {};
    private baseUrl = environment.apiUrl;
    isLoading: boolean = false;

    constructor(private http: HttpClient) {
    }

    setAirlineBlockData(data: any) {
        this.airlineBlockDataSubject.next(data);
    }

    getAirlineBlockList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'AirBlock/getAirBlockList', model);
    }

    getAirBlockFlightDetail(model: any): Observable<any> {
        return this.http.post<any>(environment.apiUrl + "AirBlock/getAirBlockDetails", model);
    }

    delete(id: any): Observable<any[]> {
        return this.http.post<any[]>(this.baseUrl + 'AirBlock/delete', { id: id });
    }

    setPublishUnpublishBonton(id: any): Observable<any[]> {
        return this.http.post<any[]>(this.baseUrl + 'AirBlock/setPublishUnpublishBonton', { id: id });
    }

    setPublishUnpublishWl(id: any): Observable<any[]> {
        return this.http.post<any[]>(this.baseUrl + 'AirBlock/setPublishUnpublishWl', { id: id });
    }

    getAirlineBlockLeadList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'AirBlock/getAirBlockLeadsList', model);
    }

    getAirlineBlockLeadDetail(id: any): Observable<any[]> {
        return this.http.post<any[]>(this.baseUrl + 'AirBlock/getAirblockBookingDetail', { id: id });
    }

    setLeadStatus(model: any): Observable<any[]> {
        return this.http.post<any[]>(this.baseUrl + 'AirBlock/setLeadStatus', model);
    }

    downloadQuotationV2(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + "AirBlock/downloadAirblockQuotationV2", { id: id });
    }

    setAuditUnaudit(id: any) {
        return this.http.post<any[]>(this.baseUrl + 'AirBlock/setAuditUnaudit', { id: id });
    }

    getSupplierCombo(filter: string, type?: string): Observable<any[]> {
        return this.http.post<any[]>(environment.apiUrl + 'Supplier/getSupplierCombo', { filter: filter, type: type });
    }

}