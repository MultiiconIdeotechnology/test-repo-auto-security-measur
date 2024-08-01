import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LedgerService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getLedger(model: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "Ledger/getLedger", model);
  }

  getAgentComboForLedger(filter: string, ledger_for: any): Observable<any[]> {
    return this.http.post<any[]>(environment.apiUrl + "Agent/getAgentComboForLedger", { filter, ledger_for });
  }
}
