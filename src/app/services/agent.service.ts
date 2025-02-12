import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class AgentService {


    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getAgentCombo(filter: string): Observable<any[]> {
        return this.http.post<any[]>(this.baseUrl + 'Agent/getAgentCombo', { filter });
    }

    getAgentComboMaster(filter: string, is_master_agent: boolean): Observable<any[]> {
        return this.http.post<any[]>(this.baseUrl + 'Agent/getAgentCombo', { filter: filter, is_master_agent: is_master_agent });
    }

    getAgentComboMasterDeshbord(filter: string, is_master_agent: boolean, MasterAgentId: string, Mode: string): Observable<any[]> {
        return this.http.post<any[]>(this.baseUrl + 'Agent/getAgentCombo', { filter: filter, is_master_agent: is_master_agent, MasterAgentId: MasterAgentId, Mode: Mode });
    }

    getFromEmployee(type: string): Observable<any[]> {
        return this.http.post<any[]>(this.baseUrl + 'CRM/Reshuffle/getFromEmployee', { type: type });
    }

    getAgentList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/getAgentList', model);
    }

    getAgentDetailList(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/getAgentEditList', { id: id });
    }

    getRMChangeList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ActivityLogs/getRMChangeList', model);
    }

    create(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/create', model);
    }

    getAgentRecord(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/getAgentRecord', { id: id });
    }

    delete(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/delete', { id: id });
    }

    regenerateNewPassword(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/regenerateNewPassword', { id: id });
    }
    
    setCashbackEnable(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/setCashbackEnable', { id: id });
    }

    // transferOldToNew
    transferOldToNew(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'WalletRecharge/TransferOldToNew_V2', model);
    }

    setBlockUnblock(id: string, note?: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/setBlockUnblock', { id, note });
    }

    setKYCVerify(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/setKYCVerify', { id });
    }

    setMarkupProfile(id: string, transactionId: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/setMarkupProfile', { id: id, transactionId: transactionId });
    }

    setBaseCurrency(id: string, base_currency_id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/changeBaseCurrency', { id: id, base_currency_id: base_currency_id });
    }

    setReferralLink(id: string, transactionId: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/setReferralLink', { id: id, transactionId: transactionId });
    }

    setRelationManager(id: string, empId: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/setRelationManager', { id: id, empId: empId });
    }

    setEmailVerify(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/setEmailVerify', model);
    }

    setEmailVerifyAgent(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/setEmailVerify', { id: id });
    }

    setMobileVerify(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/setMobileVerify', model);
    }

    setMobileVerifyAgent(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/setMobileVerify', { id: id });
    }

    mapkycProfile(id: string, KycProfileId: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/mapKycProfile', { id: id, KycProfileId: KycProfileId });
    }

    autoLogin(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/autoLogin', { id: id });
    }

    agentEdit(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/editAgentDetails', model);
    }

    TransferAgentRmToRm(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CRM/Reshuffle/TransferAgentRmToRm', model);
    }
    
    reshuffleAgentMode3(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CRM/Reshuffle/reshuffleAgentMode3', model);
    }



    TransferLeadRmToRm(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CRM/Reshuffle/TransferLeadRmToRm', model);
    }

    relationshipManagerLogsList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/relationManagerChangeLogs', model);
    }

    setKYCProfile(id: string, KycProfileId: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'AgentLead/setKYCProfile', { id: id, KycProfileId: KycProfileId });
    }

    statusChangedLogsList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'StatusChangeLogs/getStatusChangeLogsList', model);
    }

    removeAllSubagent(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Agent/deletesubAgnet', { id: id });
    }

    getLeadStatusCount(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CRM/Reshuffle/getLeadStatus', { id: id });
    }

    getLeadStatusCount1(): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CRM/Reshuffle/getLeadStatus', {});
    }

    getAgentStatusCount(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CRM/Reshuffle/getEmployeeAgentStatus', { id: id });
    }

    getAgentStatusCount1(): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CRM/Reshuffle/getEmployeeAgentStatus', {});
    }

    getLedger(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + "Ledger/getLedger", model);
    }

    getAgentLoginSession(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + "agent/getAgentLoginSession", model);
    }

    getBankList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + "Bank/getBankList", model);
    }

    getMobileCodeCombo(filter?: string): Observable<any[]> {
        return this.http.post<any[]>(environment.apiUrl + 'city/getMobileCodeCombo', { filter });
    }

    emailVerificationOTP(model: any): Observable<any> {
        return this.http.post<any>(environment.apiUrl + 'auth/agent/emailVerificationOTP', model);
    }

    mobileVerificationOTP(model: any): Observable<any> {
        return this.http.post<any>(environment.apiUrl + 'auth/agent/mobileVerificationOTP', model);
    }

    agentEmailVerify(email: string, OTP: number, agent_for?: string): Observable<any> {
        return this.http.post<any>(environment.apiUrl + ('auth/agent/emailVerify'), { email: email, code: OTP, for: agent_for });
    }

    agentMobileVerify(otp: string, mobileCode: string, whatsAppNumber: string, for_agent?: string): Observable<any> {
        return this.http.post<any>(environment.apiUrl + ('auth/agent/mobileVerify'), { code: otp, mobile_code: mobileCode, mobile_number: whatsAppNumber, for: for_agent });
    }

    setCreditcardActiveDeactive(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'paymentlink/setCC_Active', { id });
    }
}
