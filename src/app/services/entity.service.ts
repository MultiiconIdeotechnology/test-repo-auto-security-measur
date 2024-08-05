import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EntityService {
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
    private appliedOnCall = new ReplaySubject<any>();
    private refreshInstallmentCall = new ReplaySubject<any>();
    private installmentCall = new ReplaySubject<any>();

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

    public onInstallmentCall(): Observable<any> {
        return this.installmentCall.asObservable();
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

    public onrefreshreferralEntityCall(): Observable<any> {
        return this.refreshreferralEntityCall.asObservable();
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
}
