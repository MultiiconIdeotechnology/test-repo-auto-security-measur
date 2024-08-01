import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CrmService {

    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getInboxLeadList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'leadmaster/leadMasterList', model);
    }

    getArchiveLeadList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'leadmaster/archiveLeadList', model);
    }

    createInboxLead(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'leadmaster/create', model);
    }

    getCallHistoryList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CallHistory/getCallHistoryList', model);
    }

    startKycProces(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'AgentLead/startKYCProcess', model);
    }

    deadLead(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'leadmaster/deadLead', model);
    }

    createDialCall(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CallHistory/create', model);
    }

    createScheduleCall(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CallHistory/create', model);
    }

    getMarketingMessageType(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Message/getMarketingMessageType', model);
    }

    getInboxAgentList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CRM/agent/agentListInbox', model);
    }

    getPartnerAgentList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CRM/agent/agentListPartners', model);
    }

    getProductPurchaseMasterList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/getProductPurchaseMasterList', model);
    }

    getProductNameList(): Observable<any> {
        return this.http.get<any>(this.baseUrl + 'ProductPurchaseMaster/GetProductCombo', {});
    }

    createPurchaseProduct(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/createProduct', model);
    }

    deletePurchaseProduct(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/delete', model);
    }

    getTechCollectionList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CRM/WalletCredit/getTechCollectionList', model);
    }

    getTravelCollectionList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CRM/WalletCredit/getTravelCollectionList', model);
    }

    getAgentProfile(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/AgentDashboard/agentBasicDetails', { id: id });
    }

    createReceipt(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/createReceiptMaster', model);
    }

    getReceipt(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/getReceiptMasterList', model);
    }

    getProductInfoList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/getProductInfoList', model);
    }

    getInstallmentList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/getInstallmentList', model);
    }

    getBusinessAnalyticsApiData(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/AgentDashboard/agentBusinessAnalytics', model);
    }

    getBusinessPerformance(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/AgentDashboard/agentBusinessPerformance', model);
    }

    Invoice(agentId: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + "ProductPurchaseMaster/PrintInvoice", { agent_id: agentId });
    }

    dormant(agentId: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + "CRM/agent/dormantAgent", { Id: agentId });
    }

    getTechProductList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/TecDashboard/gettecdashboardList', model);
    }

    // getBusinessAnalyticsApiData(payload: any): Observable<any> {
    //     const apiData: any = {
    //         "monthWise_Pax": [
    //             { "month": "June 2024", "pax": 1 },
    //             { "month": "May 2024", "pax": 4 },
    //             { "month": "April 2024", "pax": 3 }
    //         ],
    //         "platformWisePax": [
    //             { "backgroundColor": "#FF0000" ,"platform": "B2BWEB", "pax": 8, "percentage": 100 }
    //         ],
    //         "paymentMethodWisePax": [
    //             { "backgroundColor": "#3AC977", "paymentMethod": "Wallet", "pax": 2 , "percentage": 25 },
    //             { "backgroundColor": "#0050FF", "paymentMethod": "Partial", "pax": 4 , "percentage": 25 },
    //             { "backgroundColor": "#FF5C00", "paymentMethod": "Online", "pax": 2 , "percentage": 50 }
    //         ],
    //         "serviceWisePax": [
    //             { "backgroundColor": "#3AC977", "serviceType": "Airline", "pax": 5, "percentage": 25 },
    //             { "backgroundColor": "#0050FF", "serviceType": "Bus", "pax": 3 , "percentage": 75 }
    //         ]
    //     };
    //     return of(apiData);
    // }
}
