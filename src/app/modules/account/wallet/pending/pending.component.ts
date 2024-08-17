import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
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
import { AppConfig } from 'app/config/app-config';
import { Security, filter_module_name, messages, module_name, walletRechargePermissions } from 'app/security';
import { WalletService } from 'app/services/wallet.service';
import { DateTime } from 'luxon';
import { InfoWalletComponent } from '../info-wallet/info-wallet.component';
import { Subject, Subscription } from 'rxjs';
import { EntityService } from 'app/services/entity.service';
import { RejectReasonComponent } from 'app/modules/masters/agent/reject-reason/reject-reason.component';
import { Excel } from 'app/utils/export/excel';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { AgentService } from 'app/services/agent.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.scss'],
  styles: [],
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
    PrimeNgImportsModule,
  ],
})
export class PendingComponent extends BaseListingComponent {

  @Input() isFilterShowPending: boolean
  @Input() filterApiData: any;
  @Input() activeTab: any;

  @ViewChild('tabGroup') tabGroup;
  searchInputControlPending = new FormControl('');
  filter_table_name = filter_module_name.wallet_recharge_pending;

  module_name = module_name.wallet
  dataList = [];
  total = 0;
  appConfig = AppConfig;
  pendingFilter: any = {};

  public key: any;
  public sortColumn: any;
  public sortDirection: any;
  Mainmodule: any;
  isLoading = false;
  public _unsubscribeAll: Subject<any> = new Subject<any>();
  agentList: any[] = [];
  mopList:any[] = [];
  selectedMop: any;
  selectedEmployee:any;
  public settingsUpdatedSubscription: Subscription;

  cols = [];

  constructor(
    private walletService: WalletService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    public agentService: AgentService,
    private entityService: EntityService,
    public _filterService: CommonFilterService
  ) {
    super(module_name.wallet)
    this.key = this.module_name;
    this.sortColumn = 'request_date_time';
    this.sortDirection = 'desc';
    this.Mainmodule = this

    this.pendingFilter = {
      particularId: 'all',
      mop: '',
      psp: '',
      agency_name: '',
      FromDate: new Date(),
      ToDate: new Date(),
    };

    this.pendingFilter.FromDate.setDate(1);
    this.pendingFilter.FromDate.setMonth(this.pendingFilter.FromDate.getMonth());
    this._filterService.applyDefaultFilter(this.filter_table_name);

  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      this.isFilterShowPending = true;
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      if (filterData['table_config']['request_date_time'].value && filterData['table_config']['request_date_time'].value.length) {
        this._filterService.rangeDateConvert(filterData['table_config']['request_date_time']);
      }

      this.primengTable['filters'] = filterData['table_config'];
    }
  }

  ngOnChanges() {
    if(this.activeTab == 'Pending') {
      this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
        this.sortColumn = resp['sortColumn'];
        this.primengTable['_sortField'] = resp['sortColumn'];
        if (resp['table_config']['request_date_time'].value && resp['table_config']['request_date_time'].value.length) {
          this._filterService.rangeDateConvert(resp['table_config']['request_date_time']);
        }
        this.primengTable['filters'] = resp['table_config'];
        this.isFilterShowPending = true;
        this.primengTable._filter();
      });
    }

    this.agentList = this.filterApiData.agentData;
    this.mopList = this.filterApiData.mopData;
  }

  getAgentList(value: string, bool=true) {
    this.agentService.getAgentComboMaster(value, bool).subscribe((data) => {
      this.agentList = data;
    })
  }

  getMopList(value:string){
    this.walletService.getModeOfPaymentCombo(value).subscribe((data) => {
       this.filterApiData.mopData = data;
    })
  }

  view(record) {
    if (!Security.hasViewDetailPermission(module_name.wallet)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(InfoWalletComponent, {
      data: { data: record.id, readonly: true },
      disableClose: true
    })
  }

  Audit(data: any): void {
    if (!Security.hasPermission(walletRechargePermissions.auditUnauditPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const label: string = 'Audit Wallet Recharge'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ?'
    }).afterClosed().subscribe({
      next: (res) => {
        if (res === 'confirmed') {
          this.walletService.setRechargeAudit(data.id).subscribe({
            next: () => {
              this.alertService.showToast('success', "Wallet Recharge Audited", "top-right", true);
              this.refreshItemsPending()
              this.entityService.raiseWalletAuditedCall(data.id);
            }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
          });
        }
      }
    })
  }

  // Reject(record: any): void {
  //   const label: string = 'Reject Wallet Recharge'
  //   this.conformationService.open({
  //     title: label,
  //     message: 'Are you sure to ' + label.toLowerCase() + ' ?'
  //   }).afterClosed().subscribe({
  //     next: (res) => {
  //       if (res === 'confirmed') {
  //         this.matDialog.open(RejectWalletReasoneComponent, {
  //           data: null,
  //           disableClose: true
  //         }).afterClosed().subscribe(resone => {
  //           if (!resone)
  //             return;
  //           this.walletService.setRechargeReject({ id: record.id, reject_reason: resone.reject_reasone }).subscribe({
  //             next: () => {
  //               this.alertService.showToast('success', "Wallet Recharge Rejected", "top-right", true);
  //               this.refreshItemsPending()
  //               this.entityService.raiseWalletRejectedCall(record.id);
  //             }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
  //           });
  //         })
  //       }
  //     }
  //   })

  // }

  Reject(record: any): void {
    if (!Security.hasPermission(walletRechargePermissions.rejectPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(RejectReasonComponent, {
      disableClose: true,
      data: record,
      panelClass: 'full-dialog'
    }).afterClosed().subscribe({
      next: (resone) => {
        if (resone) {
          this.walletService.setRechargeReject({ id: record.id, reject_reason: resone }).subscribe({
            next: () => {
              this.alertService.showToast('success', "Wallet Recharge Rejected", "top-right", true);
              this.refreshItemsPending()
              this.entityService.raiseWalletRejectedCall(record.id);
            },
            error: (err) => this.alertService.showToast('error', err, "top-right", true)
          })
        }
      }
    })
  }

  refreshItemsPending(event?: any) {
    this.isLoading = true;

    const filterReq = this.getNewFilterReq(event);
    filterReq['Filter'] = this.searchInputControlPending.value;
    filterReq['Status'] = 'pending';
    filterReq['particularId'] = this.pendingFilter?.particularId == "all" ? '' : this.pendingFilter?.particularId;
    filterReq['mop'] = this.pendingFilter?.mop || '';
    filterReq['psp'] = this.pendingFilter?.psp || '';
    filterReq['FromDate'] = DateTime.fromJSDate(new Date(this.pendingFilter.FromDate)).toFormat('yyyy-MM-dd');
    filterReq['ToDate'] = DateTime.fromJSDate(new Date(this.pendingFilter.ToDate)).toFormat('yyyy-MM-dd');

    this.walletService.getWalletRechargeFilterList(filterReq).subscribe(
      {
        next: data => {
          this.isLoading = false;
          this.dataList = data.data;
          this.totalRecords = data.total;
        }, error: err => {
          this.alertService.showToast('error', err);

          this.isLoading = false;
        }
      }
    );
  }

  downloadfile(data: string) {
    window.open(data, '_blank')
  }

  getNodataTextPending(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControlPending.value)
      return `no search results found for \'${this.searchInputControlPending.value}\'.`;
    else return 'No data to display';
  }

  exportExcel(event?: any): void {
    if (!Security.hasExportDataPermission(this.module_name)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const filterReq = this.getNewFilterReq(event);
    filterReq['Filter'] = this.searchInputControlPending.value;
    filterReq['Status'] = 'pending';
    filterReq['particularId'] = this.pendingFilter?.particularId == "all" ? '' : this.pendingFilter?.particularId;
    filterReq['mop'] = this.pendingFilter?.mop || '';
    filterReq['psp'] = this.pendingFilter?.psp || '';
    filterReq['FromDate'] = DateTime.fromJSDate(new Date(this.pendingFilter.FromDate)).toFormat('yyyy-MM-dd');
    filterReq['ToDate'] = DateTime.fromJSDate(new Date(this.pendingFilter.ToDate)).toFormat('yyyy-MM-dd');
    filterReq['Take'] = this.totalRecords;

    this.walletService.getWalletRechargeFilterList(filterReq).subscribe(data => {
      for (var dt of data.data) {
        dt.request_date_time = DateTime.fromISO(dt.request_date_time).toFormat('dd-MM-yyyy hh:mm a')
        dt.entry_date_time = DateTime.fromISO(dt.entry_date_time).toFormat('dd-MM-yyyy hh:mm a')
        // dt.payment_amount = dt.payment_amount + ' ' + dt.payment_currency
      }
      Excel.export(
        'Wallet Recharge Pending',
        [
          { header: 'Ref. No', property: 'reference_number' },
          { header: 'Request.', property: 'request_date_time' },
          { header: 'Agent Code', property: 'agent_code' },
          { header: 'Agent', property: 'recharge_for_name' },
          { header: 'Amount ', property: 'recharge_amount' },
          { header: 'MOP', property: 'mop' },
          { header: 'Remark', property: 'user_remark' },
        ],
        data.data, "Wallet Recharge Pending", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }]);
    });
  }

  ngOnDestroy() {
    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }

}
