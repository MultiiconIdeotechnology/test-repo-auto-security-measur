import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlightTabService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAirBookingList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AirBooking/getAirBookingListNew', model);
  }

  getAirLineList(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AirLineReport/getAirLineList', model);
  }

  getAirBookingRecord(id: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AirBooking/getAirBookingRecord', { id: id });
  }

  getSupplierCombo(filter: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Supplier/getSupplierCombo', { filter });
  }

  getAirportMstCombo(filter: string): Observable<any[]> {
    return this.http.post<any>(this.baseUrl + 'AirportMst/getAirportMstCombo', { filter });
  }

  getAirAmendmentRecord(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "AirAmendment/getAirAmendmentRecord", { id: id });
  }

  printInvoice(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'AirAmendment/printInvoice', { invoiceId: id });
  }

  setPnr(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "AirBooking/setPnr", model);
  }

  setFareType(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "AirBooking/setFareType", model);
  }

  createSegment(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "AirBooking/createSegment", model);
  }

  deleteSegment(id: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "AirBooking/deleteSegment", { id: id });
  }

  getAgentCombo(model: any): Observable<any[]> {
    return this.http.post<any[]>(this.baseUrl + 'Agent/getAgentCombo', model);
  }

  flightImport(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'AirBooking/offlinePnr', model);
  }

  flightImportPNR(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'Flight/flightImport', model);
  }

  Invoice(invoiceId: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + "AirBooking/printInvoice", { invoiceId: invoiceId });
  }

  getAmendmentTypes(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + "AirAmendment/getAmendmentTypes", { id: id });
  }

  amendmentInitiate(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + "Flight/amendmentInitiate", { id: id });
  }

  CreateAmendment(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + "AirAmendment/CreateV2", model);
  }

  getStatusLog(id: string, service: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + "AirBooking/getStatusLog", { id: id, service: service });
  }

  printBooking(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + "AirBooking/printBooking", model);
  }

  checkPaymentStatus(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + "AirBooking/checkPaymentStatus", model);
  }

  getSupplierBoCombo(type?: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + "Supplier/getSupplierBoCombo", { type: type });
  }

  generateRevertPayment(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + "Flight/generateRevertPayment", model);
  }

  visaAmendment(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + "VisaBookingPax/visaAmendment", model);
  }

  changePaxDetails(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + "AirBooking/changePaxDetails", model);
  }

  setBookingStatus(model: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + "AirBooking/setBookingStatus", model);
  }

  getPaxDetails(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + "AirBooking/getPaxDetails", { id: id });
  }

  getAirBookngStatus({ }): Observable<any> {
    return this.http.post<any>(this.baseUrl + "AirBooking/getAirBookngStatus", {});
  }

  getBookingFileLog(id: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + "AirBooking/getBookingFileLog", { id: id });
  }

}
