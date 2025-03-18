import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class VisaService {

    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getVisaList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Visa/getVisaList', model);
    }

    create(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Visa/create', model);
    }

    getVisaRecord(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Visa/getVisaRecord', { id: id });
    }

    getCityCombo(filter: string): Observable<any[]> {
        return this.http.post<any[]>(this.baseUrl + 'city/getCityCombo', { filter, });
    }

    delete(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Visa/delete', { id: id });
    }

    enableDisableVisaDestination(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Visa/enableDisableVisaDestination', { id: id });
    }

    createDocument(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'VisaDocuments/create', model);
    }

    documentsDelete(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'VisaDocuments/delete', { id: id });
    }

    getVisaDocumentsList(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'VisaDocuments/getVisaDocumentsList', { id: id });
    }

    createCharges(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'VisaCharges/create', model);
    }

    getVisaChargesList(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'VisaCharges/getVisaChargesList', { id: id });
    }

    deleteCharges(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'VisaCharges/delete', { id: id });
    }

    getVisaBookingList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'VisaBooking/getVisaBookingList', model);
    }

    getVisaBookingRecord(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Visa/getVisaBookingDetail', { id: id });
    }

    visaStartProcess(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'VisaBooking/BookingInProcess', { id: id });
    }

    uploadDoc(model: any): Observable<any[]> {
        return this.http.post<any[]>(environment.apiUrl + 'VisaBookingPaxDocuments/reupload', model);
    }
   
    audit(id: any): Observable<any[]> {
        return this.http.post<any[]>(environment.apiUrl + 'VisaBookingPaxDocuments/audit', {id:id});
    }

    visaApplied(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'VisaBookingPax/visaApplied', { id: id });
    }

    visaSuccess(id: any, file: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'VisaBookingPax/visaSuccess', { id: id, file: file });
    }

    visaReject(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'VisaBookingPax/visaReject', { id: id });
    }

    rejectVisaPaxDocument(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'VisaBookingPaxDocuments/reject', model);
    }

    addSpecialNotes(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Visa/addSpecialNotes', model);
    }

    GenerateInvoice(bookingId: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Visa/GenerateInvoice', {bookingId});
    }

    printInvoice(invoiceId: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Visa/printInvoice', {invoiceId});
    }

    visaRejectRefund(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'VisaBookingPax/visaReject', { id: id });
    }
    
    visaamendmentRefund(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Visa/visaamendment', { id: id });
    }
}
