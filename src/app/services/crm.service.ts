import { HttpClient, HttpParams } from '@angular/common/http';
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

    getPotentialLeadAgentList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CRM/agent/agentPotentialsDashboard', model);
    }


    getProductPurchaseMasterList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchase/list', model);
    }

    getProductNameList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/GetProductCombo', model);
    }

    getProductNameListNew(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchase/getProductCombo', model);
    }

    createPurchaseProduct(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchase/create', model);
    }

    deletePurchaseProduct(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchase/delete', { id: id });
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
        return this.http.post<any>(this.baseUrl + 'ProductPurchase/updateInstallmentDate', model);
    }

    createSalesreturn(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchase/salesReturn', model);
    }

    createReceipt(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/createReceiptMaster', model);
    }

    createReceiptNew(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchase/createReceipt', model);
    }



    getReceipt(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/getReceiptMasterList', model);
    }

    getProductInfoList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/getProductInfo', model);
    }

    getDataProduct(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchase/getData', { id: id });
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

    shiftProduct(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + "ProductPurchase/shiftProduct", model);
    }

    dormant(agentId: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + "CRM/agent/dormantAgent", { Id: agentId });
    }

    reactive(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'CRM/agent/reactiveAgent', model);
    }

    getPendingProductList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseService/getPendingProductList', model);
    }

    getDeliveredProductList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseService/getDeliveredProductList', model);
    }

    getTechBlockedProductList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseService/getBlockedProductList', model);
    }

    getTechDomainProductList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/TecDashboard/domainList', model);
    }

    generateSsl(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/TecDashboard/checkAndGenerateSSL', model);
    }

    startIntegration(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseService/startIntegration', model);
    }

    getData(id: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseService/getData', { id: id });
    }

    googleClosedTesting(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseService/googleClosedTesting', model);
    }

    blocked(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseService/blockUnblock', model);
    }

    unblocked(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'Dashboard/TecDashboard/UnBlockProduct', model);
    }


    activate(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseService/activeProduct', model);
    }

    getTechExpiredProductList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseService/getExpiredProductList', model);
    }

    domainList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseService/domainList', model);
    }

    getCancelledProductList(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseService/getCancelledProductList', model);
    }

    createLinkUrl(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseService/createLinkurl', model);
    }

    // getWLSettingList(agentId: any): Observable<any> {
    //     return this.http.get<any>(this.baseUrl + 'Dashboard/TecDashboard/GetWlSetting?agent_id= + '' +agentId');
    // }

    getWLSettingList(agentId: any): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}Dashboard/TecDashboard/GetWlSetting?agent_id=${agentId}`);
    }

    cancelAlert(agentId: any): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}ProductPurchase/cancelAlert?id=${agentId}`);
    }

    getWLSettingListTwoParams(agentId: any, item_name: any) {
        const params = new HttpParams()
            .set('agent_id', agentId)
            .set('item_name', item_name);

        return this.http.get(`${this.baseUrl}Dashboard/TecDashboard/GetWlSetting?${params}`);
    }

    updateStatus(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseService/updateStatus', model);
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
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseService/updateExpirydate', model);
    }

    cancelPurchaseProduct(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchase/cancel', model);
    }

    salesReturnDownloadInvoice(bookingId: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchaseMaster/printInvoice', { invoiceId: bookingId });
    }

    blockUnblock(model: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'ProductPurchase/blockUnblock', model);
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
