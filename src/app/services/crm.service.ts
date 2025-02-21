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

    getdeadLeadbyrm(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'leadmaster/getdeadLeadbyrm', model);
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

    getProductNameList(model:any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/GetProductCombo', model);
    }

    createPurchaseProduct(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/createProduct', model);
    }

    deletePurchaseProduct(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/delete', {id:id});
    }

    expiryProduct(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/ExpiredProduct', model);
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

    updateInstallment(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/Updateinstallmentdate', model);
    }

    createSalesreturn(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/createSalesreturn', model);
    }

    createReceipt(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/createReceiptMaster', model);
    }

    getReceipt(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/getReceiptMasterList', model);
    }

    getProductInfoList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/getProductInfo', model);
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

    reactive(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CRM/agent/reactiveAgent', model);
    }

    getTechProductList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/TecDashboard/gettecdashboardList', model);
    }

    getTechCompletedProductList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/TecDashboard/gettecdashboardCompletedList', model);
    }

    getTechBlockedProductList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/TecDashboard/gettecdashboardBlockedList', model);
    }

    startIntegration(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/TecDashboard/startIntegration', model);
    }
    
    googleClosedTesting(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/TecDashboard/googleClosedTesting', model);
    }

    blocked(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/TecDashboard/BlockProduct', model);
    }

    unblocked(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/TecDashboard/UnBlockProduct', model);
    }


    activate(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/TecDashboard/ActivateProduct', model);
    }

    getTechExpiredProductList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/TecDashboard/gettecdashboardExpiredList', model);
    }

    createLinkUrl(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/TecDashboard/createLinkurl', model);
    }

    // getWLSettingList(agentId: any): Observable<any> {
    //     return this.http.get<any>(this.baseUrl + 'Dashboard/TecDashboard/GetWlSetting?agent_id= + '' +agentId');
    // }

    getWLSettingList(agentId: any): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}Dashboard/TecDashboard/GetWlSetting?agent_id=${agentId}`);
    }

    updateStatus(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/TecDashboard/updatestatus', model);
    }

    // getStatusChangedLog(model: any): Observable<any> {
    //     return this.http.post<any>(this.baseUrl + 'Dashboard/TecDashboard/getStatusChangeLog', model);
    // }

    getStatusChangedLog(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/TecDashboard/getStatusChangeLogsList', model);
    }

    getStatusChangeLogsList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'StatusChangeLogs/getStatusChangeLogsList', model);
    }

    createwlSetting(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/TecDashboard/createwlSetting', model);
    }

    deleteProductReceipt(id: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Receipt/delete', { id: id });
    }

    getTechSendReminderWAEmail(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CRM/WalletCredit/sendTechRemindersWhatsappEmail', model);
    }

    getTravelSendReminderWAEmail(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CRM/WalletCredit/sendRemindersWhatsappEmail', model);
    }

    updateExpiryDate(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/TecDashboard/UpdateExpirydate', model);
    }

    cancelPurchaseProduct(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/CancelProduct', model);
    }

    salesReturnDownloadInvoice(bookingId: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/printInvoice', { invoiceId: bookingId });
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
