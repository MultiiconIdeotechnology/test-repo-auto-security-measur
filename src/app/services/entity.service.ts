import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  private searchChange = new Subject<any>();
  private WithdrawAuditedCall = new Subject<any>();
  private WithdrawRejectedCall = new Subject<any>();
  private WalletAuditedCall = new Subject<any>();
  private WalletRejectedCall = new Subject<any>();

  constructor() { }

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
}
