import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AppConfig } from 'app/config/app-config';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, messages, module_name, walletCreditPermissions, walletRechargePermissions } from 'app/security';
import { WalletService } from 'app/services/wallet.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { takeUntil, debounceTime } from 'rxjs';
import { AuditedComponent } from './audited/audited.component';
import { PendingComponent } from './pending/pending.component';
import { RejectedComponent } from './rejected/rejected.component';
import { WalletFilterComponent } from './wallet-filter/wallet-filter.component';
import { WalletInfoComponent } from './wallet-info/wallet-info.component';
import { AgentService } from 'app/services/agent.service';
import { WalletEntryComponent } from './wallet-entry/wallet-entry.component';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
  styles: [`
  .tbl-grid {
    grid-template-columns: 40px 200px 190px 160px 150px 130px 190px;
  }
  `],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    CommonModule,
    MatTabsModule,
    PendingComponent,
    AuditedComponent,
    RejectedComponent,

  ],
})
export class WalletComponent extends BaseListingComponent implements OnDestroy {
  module_name = module_name.wallet;

  @ViewChild('pending') pending: PendingComponent;
  @ViewChild('audited') audited: AuditedComponent;
  @ViewChild('rejected') rejected: RejectedComponent;
  public apiCalls: any = {};
  tabName: any
  tabNameStr: any = 'Pending'
  tab: string = 'Pending';
  isSecound: boolean = true
  isThird: boolean = true
  filterData: any = {};

  @ViewChild(MatPaginator) public _paginatorPending: MatPaginator;
  @ViewChild(MatSort) public _sortPending: MatSort;
  searchInputControlPending = new FormControl('');

  @ViewChild(MatPaginator) public _paginatorAudit: MatPaginator;
  @ViewChild(MatSort) public _sortPaid: MatSort;
  searchInputControlAudit = new FormControl('');

  @ViewChild(MatPaginator) public _paginatorRejected: MatPaginator;
  @ViewChild(MatSort) public _sortRejected: MatSort;
  searchInputControlRejected = new FormControl('');

  isFilterShowPending: boolean = false;
  isFilterShowAudit: boolean = false;
  isFilterShowReject: boolean = false;
  filterApiData:any = {};
  agentData: any[] = [];
  mopData:any[] = [];
  pspData:any[] = [];


  constructor(
    private walletService: WalletService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private agentService: AgentService,
  ) {
    super(module_name.wallet)
    this.key = this.module_name;
    this.sortColumn = 'request_date_time';
    this.sortDirection = 'asc';
    this.Mainmodule = this

    this.filterData = {
      particularId: 'all',
      mop: '',
      psp: '',
      agency_name: '',
      FromDate: new Date(),
      ToDate: new Date(),
    };

    this.filterData.FromDate.setDate(1);
    this.filterData.FromDate.setMonth(this.filterData.FromDate.getMonth());
  }

  ngOnInit(): void {

    // this.searchInputControlPending.valueChanges
    //   .pipe(
    //     takeUntil(this._unsubscribeAll),
    //     debounceTime(AppConfig.searchDelay)
    //   )
    //   .subscribe((value) => {
    //     this.pending.searchInputControlPending.patchValue(value)
    //   });

    // this.searchInputControlAudit.valueChanges
    //   .pipe(
    //     takeUntil(this._unsubscribeAll),
    //     debounceTime(AppConfig.searchDelay)
    //   )
    //   .subscribe((value) => {
    //     this.audited.searchInputControlAudit.patchValue(value)
    //   });

    // this.searchInputControlRejected.valueChanges
    //   .pipe(
    //     takeUntil(this._unsubscribeAll),
    //     debounceTime(AppConfig.searchDelay)
    //   )
    //   .subscribe((value) => {
    //     this.rejected.searchInputControlRejected.patchValue(value)
    //   });

    this.getAgentList("");
    this.getMopList("");
    this.getPspList("");

    // this.agentService.getAgentCombo("").subscribe({
    //   next: (value: any) => {

    // this.audited.auditListFilter = this.filterData;
    // this.rejected.rejectFilter = this.filterData;
    // this.pending.pendingFilter = this.filterData;

    // this.pending.refreshItemsPending()
    //   },
    // });

  }

  getAgentList(value: string) {
    this.agentService.getAgentCombo(value).subscribe((data) => {
      this.filterApiData.agentData = data;
    })
  }

  getMopList(value:string){
    this.walletService.getModeOfPaymentCombo(value).subscribe((data) => {
       this.filterApiData.mopData = data;
    })
  }

  getPspList(value:string){
    this.walletService.getPaymentGatewayCombo(value).subscribe((data) => {
      this.filterApiData.pspData = data;
    })
  }

  rejectedRefresh(event:any){
    this.rejected.searchInputControlRejected.patchValue(event)
    this.rejected.refreshItemsRejected()
  }
  
  auditedRefresh(event:any){
    this.audited.searchInputControlAudit.patchValue(event)
    this.audited.refreshItemsAudited()
  }
  
  pendingRefresh(event:any){
    this.pending.searchInputControlPending.patchValue(event)
    this.pending.refreshItemsPending()
  }



  public getTabsPermission(tab: string): boolean {
    if (tab == 'pending')
      return Security.hasPermission(walletRechargePermissions.pendingTabPermissions)
    if (tab == 'audited')
      return Security.hasPermission(walletRechargePermissions.auditedTabPermissions)
    if (tab == 'rejected')
      return Security.hasPermission(walletRechargePermissions.rejectedTabPermissions)
  }

  public tabChanged(event: any): void {

    const tabName = event?.tab?.ariaLabel;
    this.tabNameStr = tabName
    this.tabName = tabName

    switch (tabName) {
      case 'Pending':
        this.tab = 'Pending';
        break;

      case 'Audited':
        this.tab = 'Audited';
        if (this.isSecound) {
          this.audited.refreshItemsAudited()
          this.isSecound = false
        }
        break;

      case 'Rejected':
        this.tab = 'Rejected';
        if (this.isThird) {
          this.rejected.refreshItemsRejected()
          this.isThird = false
        }
        break;
    }
  }

  private ifNotThenCall(call: string, callback: () => void): void {
    if (!this.apiCalls[call]) {
      this.apiCalls[call] = false;
      callback();
    }
  }

  createInternal() {
    this.matDialog.open(WalletEntryComponent, {
      data: { data: null, send: 'create' },
      disableClose: true,
    })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.alertService.showToast(
            'success',
            'New record added',
            'top-right',
            true
          );
          this.pending.refreshItemsPending()
          this.audited.refreshItemsAudited()
          this.rejected.refreshItemsRejected()
        }
      });
  }

  ngAfterViewInit(): void {
    this.audited.auditListFilter = this.filterData;
    this.rejected.rejectFilter = this.filterData;
    this.pending.pendingFilter = this.filterData;

    this.apiCalls = {
      Pending: false,
      Audited: false,
      Rejected: false,
    };
  }

  filter(): void {
    this.matDialog.open(WalletFilterComponent, {
      data: this.filterData,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (!res)
        return;
      this.filterData = res
      this.pending.pendingFilter = this.filterData;
      this.audited.auditListFilter = this.filterData;
      this.rejected.rejectFilter = this.filterData;
      this.pending.refreshItemsPending()
      this.audited.refreshItemsAudited()
      this.rejected.refreshItemsRejected()
    })
  }

  refreshItemsTab(): void {
    if (this.tab == 'Audited')
      this.audited.refreshItemsAudited()
    else if (this.tab == 'Rejected')
      this.rejected.refreshItemsRejected()
    else
      this.pending.refreshItemsPending()
  }

  exportExcel(): void {
    if (this.tab == 'Audited')
      this.audited.exportExcel()
    else if (this.tab == 'Rejected')
      this.rejected.exportExcel()
    else
      this.pending.exportExcel()
  }


}
