import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EntityService {
    private updateChargeCall = new ReplaySubject<any>();
    private refreshUpdateChargeCall = new ReplaySubject<any>();
    private amendmentReqInfo = new ReplaySubject<any>();
    private searchChange = new Subject<any>();
    private WithdrawAuditedCall = new Subject<any>();
    private WithdrawRejectedCall = new Subject<any>();
    private WalletAuditedCall = new Subject<any>();
    private WalletRejectedCall = new Subject<any>();
    private leadEntityCall = new ReplaySubject<any>();
    private refreshleadEntityCall = new ReplaySubject<any>();
    private referralEntityCall = new ReplaySubject<any>();
    private editreferralEntityCall = new ReplaySubject<any>();
    private refreshreferralEntityCall = new ReplaySubject<any>();
    private refresheditreferralEntityCall = new ReplaySubject<any>();
    private refreshproductPurchaseCall = new ReplaySubject<any>();
    private productPurchaseCall = new ReplaySubject<any>();
    private refreshReceiptCall = new ReplaySubject<any>();
    private receiptCall = new ReplaySubject<any>();
    private bankDetailsCall = new ReplaySubject<any>();
    private refreshbankDetailsCall = new ReplaySubject<any>();
    private cachingParametersCall = new ReplaySubject<any>();
    private refreshcachingParametersCall = new ReplaySubject<any>();
    private changeEmailNumber = new ReplaySubject<any>();
    private refreshchangeEmailNumberCall = new ReplaySubject<any>();
    private infoWithdrawCall = new ReplaySubject<any>();
    private supplierKycInfoCall = new ReplaySubject<any>();
    private agentKycInfoCall = new ReplaySubject<any>();
    private appliedOnCall = new ReplaySubject<any>();
    private refreshInstallmentCall = new ReplaySubject<any>();
    private installmentCall = new ReplaySubject<any>();
    private refreshCRMSalesReturnCall = new ReplaySubject<any>();
    private crmSalesReturnCall = new ReplaySubject<any>();
    private paymentLinkEntityCall = new ReplaySubject<any>();
    private refreshPaymentLinkEntityCall = new ReplaySubject<any>();

    private refreshWalletRechargeCall = new ReplaySubject<any>();
    private walletRechargeCall = new ReplaySubject<any>();

    constructor() { }

    /********Receipt***********/
    public raiserefreshReceiptCall(item): void {
        this.refreshReceiptCall.next(item);
    }

    public onrefreshReceiptCalll(): Observable<any> {
        return this.refreshReceiptCall.asObservable();
    }

    public raisereceiptCall(item): void {
        this.receiptCall.next(item);
    }

    public onreceiptCall(): Observable<any> {
        return this.receiptCall.asObservable();
    }

    /******** Installment***********/
    public raiserefreshInstallmentCall(item): void {
        this.refreshInstallmentCall.next(item);
    }

    public onrefreshInstallmentCalll(): Observable<any> {
        return this.refreshInstallmentCall.asObservable();
    }

    public raiserInstallmentCall(item): void {
        this.installmentCall.next(item);
    }

    private amendmentStatusInfo = new ReplaySubject<any>();
    public onInstallmentCall(): Observable<any> {
        return this.installmentCall.asObservable();
    }

    /******** CRM Sales Return ***********/
    public raiseCRMrefreshSalesReturnCall(item): void {
        this.refreshCRMSalesReturnCall.next(item);
    }

    public onCRMrefreshSalesReturnCall(): Observable<any> {
        return this.refreshCRMSalesReturnCall.asObservable();
    }

    public raiseCRMSalesReturnCall(item): void {
        this.crmSalesReturnCall.next(item);
    }

    public onCRMSalesReturnCall(): Observable<any> {
        return this.crmSalesReturnCall.asObservable();
    }

    /********Wallet Recharge***********/
    public raiserefreshWalletRechargeCall(item): void {
        this.refreshWalletRechargeCall.next(item);
    }

    public onrefreshrefreshWalletRechargeCall(): Observable<any> {
        return this.refreshWalletRechargeCall.asObservable();
    }

    public raisewalletRechargeCall(item): void {
        this.walletRechargeCall.next(item);
    }

    public onwalletRechargeCall(): Observable<any> {
        return this.walletRechargeCall.asObservable();
    }

    /********Product Purchase***********/
    public raiserefreshproductPurchaseCall(item): void {
        this.refreshproductPurchaseCall.next(item);
    }

    public onrefreshproductPurchaseCall(): Observable<any> {
        return this.refreshproductPurchaseCall.asObservable();
    }

    public raiseproductPurchaseCall(item): void {
        this.productPurchaseCall.next(item);
    }

    public onproductPurchaseCall(): Observable<any> {
        return this.productPurchaseCall.asObservable();
    }

    /********Referral Entity***********/

    public raiserefreshleadEntityCall(item): void {
        this.refreshleadEntityCall.next(item);
    }

    public onrefreshleadEntityCall(): Observable<any> {
        return this.refreshleadEntityCall.asObservable();
    }

    public raisereferralEntityCall(item): void {
        this.referralEntityCall.next(item);
    }

    public onreferralEntityCall(): Observable<any> {
        return this.referralEntityCall.asObservable();
    }

    public raiserefreshreferralEntityCall(item): void {
        this.refreshreferralEntityCall.next(item);
    }

  
  // Amendment Update Charge Drawer
  public raiseUpdateChargeCall(item: any): void {
    this.updateChargeCall.next(item);
  }

  public onUpdateChargeCall(): Observable<any> {
    return this.updateChargeCall.asObservable();
  }

  public raiserefreshUpdateChargeCall(item: any): void {
    this.refreshUpdateChargeCall.next(item);
  }

  public onraiserefreshUpdateChargeCall(): Observable<any> {
    return this.refreshUpdateChargeCall.asObservable();
  }
  // ### End ### //

  // Amendment Request Info Drawer
  public raiseAmendmentInfoCall(item: any): void {
    this.amendmentReqInfo.next(item);
  }

  public onAmendmentInfoCall(): Observable<any> {
    return this.amendmentReqInfo.asObservable();
  }
  // ### End ### //

  // Amendment Status Drawer
  public raiseAmendmentStatusInfoCall(item: any): void {
    this.amendmentStatusInfo.next(item);
  }

  public onAmendmentStatusInfoCall(): Observable<any> {
    return this.amendmentStatusInfo.asObservable();
  }
    public onrefreshreferralEntityCall(): Observable<any> {
        return this.refreshreferralEntityCall.asObservable();
    }

    // Payment Link
    public raisePaymentLinkEntityCall(item): void {
        this.paymentLinkEntityCall.next(item);
    }

    public onPaymentLinkEntityCall(): Observable<any> {
        return this.paymentLinkEntityCall.asObservable();
    }

    public raiseRefreshPaymentLinkEntityCall(item): void {
        this.refreshPaymentLinkEntityCall.next(item);
    }

    public onRefreshPaymentLinkEntityCall(): Observable<any> {
        return this.refreshPaymentLinkEntityCall.asObservable();
    }

    public raiseleadEntityCall(item): void {
        this.leadEntityCall.next(item);
    }

    public onleadEntityCall(): Observable<any> {
        return this.leadEntityCall.asObservable();
    }

    public raiseSearchChange(item): void {
        this.searchChange.next(item);
    }

    public onSearchChange(): Observable<any> {
        return this.searchChange.asObservable();
    }

    public raiseWithdrawAuditedCall(item): void {
        this.WithdrawAuditedCall.next(item);
    }

    public onWithdrawAuditedCall(): Observable<any> {
        return this.WithdrawAuditedCall.asObservable();
    }

    public raiseWithdrawRejectedCall(item): void {
        this.WithdrawRejectedCall.next(item);
    }

    public onWithdrawRejectedCall(): Observable<any> {
        return this.WithdrawRejectedCall.asObservable();
    }

    public raiseWalletAuditedCall(item): void {
        this.WalletAuditedCall.next(item);
    }

    public onWalletAuditedCall(): Observable<any> {
        return this.WalletAuditedCall.asObservable();
    }

    public raiseWalletRejectedCall(item): void {
        this.WalletRejectedCall.next(item);
    }

    public onWalletRejectedCall(): Observable<any> {
        return this.WalletRejectedCall.asObservable();
    }

    /********Bank Details***********/

    public raisebankDetailsCall(item): void {
        this.bankDetailsCall.next(item);
    }

    public onbankDetailsCall(): Observable<any> {
        return this.bankDetailsCall.asObservable();
    }

    public onrefreshbankDetailsCall(): Observable<any> {
        return this.refreshbankDetailsCall.asObservable();
    }

    public raiserefreshbankDetailsCall(item): void {
        this.refreshbankDetailsCall.next(item);
    }

    /********Info Withdraw***********/

    public raiseInfoWithdraw(item): void {
        this.infoWithdrawCall.next(item);
    }

    public onInfoWithdraw(): Observable<any> {
        return this.infoWithdrawCall.asObservable();
    }

    /********Info Supplier KYC***********/

    public raisesupplierKycInfo(item): void {
        this.supplierKycInfoCall.next(item);
    }

    public onsupplierKycInfo(): Observable<any> {
        return this.supplierKycInfoCall.asObservable();
    }

    /********Info Agent KYC***********/

    public raiseagentKycInfo(item): void {
        this.agentKycInfoCall.next(item);
    }

    public onagentKycInfo(): Observable<any> {
        return this.agentKycInfoCall.asObservable();
    }

    /********Caching parameters***********/
    public raisecachingParametersCall(item): void {
        this.cachingParametersCall.next(item);
    }

    public oncachingParametersCall(): Observable<any> {
        return this.cachingParametersCall.asObservable();
    }

    public onrefreshcachingParametersCall(): Observable<any> {
        return this.refreshcachingParametersCall.asObservable();
    }

    public raiserefreshcachingParametersCall(item): void {
        this.refreshcachingParametersCall.next(item);
    }

    /********Change Email Number***********/

    public raiseChangeEmailNumberCall(item): void {
        this.changeEmailNumber.next(item);
    }

    public onChangeEmailNumberCall(): Observable<any> {
        return this.changeEmailNumber.asObservable();
    }

    public onrefreshChangeEmailNumberCall(): Observable<any> {
        return this.refreshchangeEmailNumberCall.asObservable();
    }

    public raiserefreshChangeEmailNumberCall(item): void {
        this.refreshchangeEmailNumberCall.next(item);
    }

    /********Mark Up Applied On***********/

    public raiseappliedOnCall(item): void {
        this.appliedOnCall.next(item);
    }

    public onappliedOnCall(): Observable<any> {
        return this.appliedOnCall.asObservable();
    }

    /******** Forex ***********/

    private forexEntityCall = new ReplaySubject<any>();

    public onForexEntityCall(): Observable<any> {
        return this.forexEntityCall.asObservable();
    }

    public raiseForexEntityCall(item): void {
        this.forexEntityCall.next(item);
    }
}
