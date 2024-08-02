import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, NgModule, OnDestroy, ViewChild } from '@angular/core';
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
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, module_name, withdrawPermissions } from 'app/security';
import { WithdrawService } from 'app/services/withdraw.service';
import { WithdrawEntryComponent } from '../withdraw-entry/withdraw-entry.component';
import { WPendingComponent } from '../pending/pending.component';
import { WAuditedComponent } from '../audited/audited.component';
import { WRejectedComponent } from '../rejected/rejected.component';
import { AppConfig } from 'app/config/app-config';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { takeUntil, debounceTime, filter } from 'rxjs';
import { FilterComponent } from '../filter/filter.component';
import { AgentService } from 'app/services/agent.service';
import { BankDetailsRightComponent } from '../bank-details-right/bank-details-right.component';
import { InfoWithdrawComponent } from '../info-withdraw/info-withdraw.component';

@Component({
  selector: 'app-withdraw-list',
  templateUrl: './withdraw-list.component.html',
  styleUrls: ['./withdraw-list.component.scss'],
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
    WPendingComponent,
    WAuditedComponent,
    WRejectedComponent,
    BankDetailsRightComponent,
    InfoWithdrawComponent
  ],
})
export class WithdrawListComponent extends BaseListingComponent implements OnDestroy {

  @ViewChild('pending') pending: WPendingComponent;
  @ViewChild('audited') audited: WAuditedComponent;
  @ViewChild('rejected') rejected: WRejectedComponent;
  public apiCalls: any = {};
  tabName: any
  tabNameStr: any = 'Pending'
  tab: string = 'Pending';
  isSecound: boolean = true
  isThird: boolean = true
  filterData: any = {};
  module_name = module_name.withdraw
  agentData: any[] = [];

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

  constructor(
    private agentService: AgentService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
  ) {
    super(module_name.withdraw)
    // this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'request_date_time';
    this.sortDirection = 'asc';
    this.Mainmodule = this

    this.filterData = {
      agent_id: 'all',
      FromDate: new Date(),
      ToDate: new Date(),
    };

    this.filterData.FromDate.setDate(1);
    this.filterData.FromDate.setMonth(this.filterData.FromDate.getMonth());
  }

  public getTabsPermission(tab: string): boolean {
    if (tab == 'pending')
      return Security.hasPermission(withdrawPermissions.pendingTabPermissions)
    if (tab == 'audited')
      return Security.hasPermission(withdrawPermissions.auditedTabPermissions)
    if (tab == 'rejected')
      return Security.hasPermission(withdrawPermissions.rejectedTabPermissions)
  }

  ngOnInit(): void {

    // this.agentService.getAgentCombo("").subscribe({
    //   next: (value: any) => {
    //     this.filterData.agent_id = value[0].id;
    //     this.filterData.agency_name = value[0].agency_name;

    //     this.audited.filter = this.filterData;
    //     this.rejected.filter = this.filterData;
    //     this.pending.filter = this.filterData;

    //     this.pending.refreshItemsPending()
    //   },
    // });

    this.searchInputControlPending.valueChanges
      .pipe(
        takeUntil(this._unsubscribeAll),
        debounceTime(AppConfig.searchDelay)
      )
      .subscribe((value) => {
        this.pending.searchInputControlPending.patchValue(value)
        
      });

    this.searchInputControlAudit.valueChanges
      .pipe(
        takeUntil(this._unsubscribeAll),
        debounceTime(AppConfig.searchDelay)
      )
      .subscribe((value) => {
        this.audited.searchInputControlAudit.patchValue(value)
      });

    this.searchInputControlRejected.valueChanges
      .pipe(
        takeUntil(this._unsubscribeAll),
        debounceTime(AppConfig.searchDelay)
      )
      .subscribe((value) => {
        this.rejected.searchInputControlRejected.patchValue(value)
      });

      this.getAgentList("");
  }

  getAgentList(value: string) {
    this.agentService.getAgentCombo(value).subscribe((data) => {
      this.agentData = data;
      
    })
  }

  rejectedRefresh(){
    this.rejected.refreshItemsRejected()
  }

  auditedRefresh(){
    this.audited.refreshItemsAudited()
  }
  
  pendingRefresh(){
    this.pending.refreshItemsPending()
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
          this.isSecound = false
          this.audited.refreshItemsAudited()
        }
        break;

      case 'Rejected':
        this.tab = 'Rejected';
        if (this.isThird) {
          this.isThird = false
          this.rejected.refreshItemsRejected()
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

  ngAfterViewInit(): void {
    this.apiCalls = {
      Pending: false,
      Audited: false,
      Rejected: false,
    };

    setTimeout(() => {
      this.audited.filter = this.filterData;
      this.rejected.filter = this.filterData;
      this.pending.filter = this.filterData;
    });
  }

  createInternal(): void {
    this.matDialog.open(WithdrawEntryComponent, {
      disableClose: true,
      data: null
    }).afterClosed().subscribe(res => {
      if (res) {
        this.pending.refreshItemsPending()
        this.audited.refreshItemsAudited()
        this.rejected.refreshItemsRejected()
      }
    });
  }

  filter(): void {
    this.matDialog.open(FilterComponent, {
      data: this.filterData,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (!res)
        return;
      this.filterData = res
      this.audited.filter = this.filterData;
      this.rejected.filter = this.filterData;
      this.pending.filter = this.filterData;
      this.pending.refreshItemsPending()
      this.audited.refreshItemsAudited()
      this.rejected.refreshItemsRejected()
      if (res) {
      }
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
}
