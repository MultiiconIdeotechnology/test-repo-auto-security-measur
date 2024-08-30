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
import { Security, filter_module_name, module_name, withdrawPermissions } from 'app/security';
import { WithdrawEntryComponent } from '../withdraw-entry/withdraw-entry.component';
import { WPendingComponent } from '../pending/pending.component';
import { WAuditedComponent } from '../audited/audited.component';
import { WRejectedComponent } from '../rejected/rejected.component';
import { AppConfig } from 'app/config/app-config';
import { takeUntil, debounceTime, filter } from 'rxjs';
import { FilterComponent } from '../filter/filter.component';
import { AgentService } from 'app/services/agent.service';
import { BankDetailsRightComponent } from '../bank-details-right/bank-details-right.component';
import { InfoWithdrawComponent } from '../info-withdraw/info-withdraw.component';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

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

  filter_table_name = filter_module_name;
  public apiCalls: any = {};
  tabName: any
  tabNameStr: any = 'Pending'
  tab: string = 'Pending';
  isSecound: boolean = true
  isThird: boolean = true
  filterData: any = {};
  module_name = module_name.withdraw
  filterApiData: any = {};

  searchInputControlPending = new FormControl('');
  searchInputControlAudit = new FormControl('');
  searchInputControlRejected = new FormControl('');

  isFilterShowPending: boolean = false;
  isFilterShowAudit: boolean = false;
  isFilterShowReject: boolean = false;

  constructor(
    private agentService: AgentService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    public _filterService: CommonFilterService
  ) {
    super(module_name.withdraw)
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

  ngOnInit(): void {
    this.getAgentList("");
  }

  getAgentList(value: string) {
    this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
      this.filterApiData.agentData = data;

      for (let i in this.filterApiData.agentData) {
				this.filterApiData.agentData[i]['agent_info'] = `${this.filterApiData.agentData[i].code}-${this.filterApiData.agentData[i].agency_name}-${this.filterApiData.agentData[i].email_address}`
			}
    })
  }

  rejectedRefresh(event: any) {
    this.rejected.searchInputControlRejected.patchValue(event)
    this.rejected.refreshItemsRejected()
  }

  auditedRefresh(event: any) {
    this.audited.searchInputControlAudit.patchValue(event)
    this.audited.refreshItemsAudited()
  }

  pendingRefresh(event: any) {
    this.pending.searchInputControlPending.patchValue(event);
    this.pending.refreshItemsPending()
  }

  public getTabsPermission(tab: string): boolean {
    if (tab == 'pending')
      return Security.hasPermission(withdrawPermissions.pendingTabPermissions)
    if (tab == 'audited')
      return Security.hasPermission(withdrawPermissions.auditedTabPermissions)
    if (tab == 'rejected')
      return Security.hasPermission(withdrawPermissions.rejectedTabPermissions)
  }

  public tabChanged(event: any): void {
    const tabName = event?.tab?.ariaLabel;
    this.tabNameStr = tabName
    this.tabName = tabName

    switch (tabName) {
      case 'Pending':
        // this._filterService.applyDefaultFilter(this.filter_table_name.withdraw_pending);
        this.tab = 'Pending';
        break;
      case 'Audited':
        // this._filterService.applyDefaultFilter(this.filter_table_name.withdraw_audited);
        this.tab = 'Audited';
        // this.isSecound = false
        setTimeout(() => {
          this.audited.refreshItemsAudited()
        }, 0);
        break;
      case 'Rejected':
        // this._filterService.applyDefaultFilter(this.filter_table_name.withdraw_rejected);
        this.tab = 'Rejected';
        // this.isThird = false
        setTimeout(() => {
          this.rejected.refreshItemsRejected()
        }, 0);
        break;
    }
  }

  openTabFiterDrawer() {
    if (this.tab == 'Audited') {
      this._filterService.openDrawer(this.filter_table_name.withdraw_audited, this.audited.primengTable);
    } else if (this.tab == 'Rejected') {
      this._filterService.openDrawer(this.filter_table_name.withdraw_rejected, this.rejected.primengTable);
    } else {
      this._filterService.openDrawer(this.filter_table_name.withdraw_pending, this.pending.primengTable);
    }
  }

  // ngAfterViewInit(): void {
  //   this.apiCalls = {
  //     Pending: false,
  //     Audited: false,
  //     Rejected: false,
  //   };

  //   setTimeout(() => {
  //     this.audited.filter = this.filterData;
  //     this.rejected.filter = this.filterData;
  //     this.pending.filter = this.filterData;
  //   });
  // }

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

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.unsubscribe();
  }

}
