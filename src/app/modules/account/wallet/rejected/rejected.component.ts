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
import { Security, messages, module_name } from 'app/security';
import { MasterService } from 'app/services/master.service';
import { WalletService } from 'app/services/wallet.service';
import { Subject, Subscription } from 'rxjs';
import { InfoWalletComponent } from '../info-wallet/info-wallet.component';
import { DateTime } from 'luxon';
import { EntityService } from 'app/services/entity.service';
import { Excel } from 'app/utils/export/excel';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { AgentService } from 'app/services/agent.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
  selector: 'app-rejected',
  templateUrl: './rejected.component.html',
  styleUrls: ['./rejected.component.scss'],
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
export class RejectedComponent extends BaseListingComponent {

  @Input() isFilterShowReject: boolean
  @Input() filterApiData: any;
  @Input() activeTab: any;

  @ViewChild('tabGroup') tabGroup;
  searchInputControlRejected = new FormControl('');
  Mainmodule: any;
  isLoading = false;
  public _unsubscribeAll: Subject<any> = new Subject<any>();

  module_name = module_name.wallet
  dataList = [];
  total = 0;
  appConfig = AppConfig;
  data: any
  public key: any;
  public sortColumn: any;
  public sortDirection: any;
  rejectFilter: any = {};
  agentList: any[] = [];
  mopList:any[] = [];
  selectedMop:any;
  selectedEmployee:any;
  public settingsRejectSubscription: Subscription;

  cols = [];
  protected masterService: MasterService;

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

  }

  ngOnInit(): void {

  }

  ngOnChanges() {
    if (this.activeTab == 'Rejected') {
      this.settingsRejectSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {

        this.sortColumn = resp['sortColumn'];
        this.primengTable['_sortField'] = resp['sortColumn'];
        if (resp['table_config']['request_date_time'].value && resp['table_config']['request_date_time'].value.length) {
          this._filterService.rangeDateConvert(resp['table_config']['request_date_time']);
        }
        if (resp['table_config']['rejected_date_time'].value) {
            resp['table_config']['rejected_date_time'].value = new Date(resp['table_config']['rejected_date_time'].value);
        }
        this.primengTable['filters'] = resp['table_config'];
        this.isFilterShowReject = true;
        this.primengTable._filter();
      });

      // ngAfterViewInit
      if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
        this.isFilterShowReject = true;
        let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
        if (filterData['table_config']['request_date_time'].value && filterData['table_config']['request_date_time'].value.length) {
          this._filterService.rangeDateConvert(filterData['table_config']['request_date_time']);
        }
        if (filterData['table_config']['rejected_date_time'].value) {
            filterData['table_config']['rejected_date_time'].value = new Date(filterData['table_config']['rejected_date_time'].value);
        }

        this.primengTable['filters'] = filterData['table_config'];
      }
    }

    this.agentList = this.filterApiData?.agentData;
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
    const label: string = 'Audit Wallet Recharge'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ?'
    }).afterClosed().subscribe({
      next: (res) => {
        if (res === 'confirmed') {
          this.walletService.setRechargeAudit(data.id).subscribe({
            next: () => {
              this.alertService.showToast('success', "Document Audited", "top-right", true);
              this.refreshItemsRejected()
            }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
          });
        }
      }
    })
  }

  Reject(record: any): void {
    const label: string = 'Reject Wallet Recharge'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ?'
    }).afterClosed().subscribe({
      next: (res) => {
        if (res === 'confirmed') {
          this.walletService.setRechargeReject(record.id).subscribe({
            next: () => {
              this.alertService.showToast('success', "Document Audited", "top-right", true);
              this.refreshItemsRejected()
            }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
          });
        }
      }
    })
  }

  refreshItemsRejected(event?: any) {

    this.isLoading = true;

    const filterReq = this.getNewFilterReq(event);
    filterReq['Filter'] = this.searchInputControlRejected.value;
    filterReq['Status'] = 'rejected';
    filterReq['particularId'] = this.rejectFilter?.particularId == "all" ? '' : this.rejectFilter?.particularId;
    filterReq['mop'] = this.rejectFilter?.mop || '';
    filterReq['psp'] = this.rejectFilter?.psp || '';
    filterReq['FromDate'] = DateTime.fromJSDate(new Date(this.rejectFilter.FromDate)).toFormat('yyyy-MM-dd');
    filterReq['ToDate'] = DateTime.fromJSDate(new Date(this.rejectFilter.ToDate)).toFormat('yyyy-MM-dd');

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

  getNodataTextRejected(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControlRejected.value)
      return `no search results found for \'${this.searchInputControlRejected.value}\'.`;
    else return 'No data to display';
  }

  exportExcel(event?: any): void {
    if (!Security.hasExportDataPermission(this.module_name)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const filterReq = this.getNewFilterReq(event);
    filterReq['Filter'] = this.searchInputControlRejected.value;
    filterReq['Status'] = 'rejected';
    filterReq['particularId'] = this.rejectFilter?.particularId == "all" ? '' : this.rejectFilter?.particularId;
    filterReq['mop'] = this.rejectFilter?.mop || '';
    filterReq['psp'] = this.rejectFilter?.psp || '';
    filterReq['FromDate'] = DateTime.fromJSDate(new Date(this.rejectFilter.FromDate)).toFormat('yyyy-MM-dd');
    filterReq['ToDate'] = DateTime.fromJSDate(new Date(this.rejectFilter.ToDate)).toFormat('yyyy-MM-dd');
    filterReq['Skip'] = 0;
    filterReq['Take'] = this.totalRecords;


    this.walletService.getWalletRechargeFilterList(filterReq).subscribe(data => {
      for (var dt of data.data) {
        dt.rejected_date_time = DateTime.fromISO(dt.rejected_date_time).toFormat('dd-MM-yyyy hh:mm a')
        dt.request_date_time = DateTime.fromISO(dt.request_date_time).toFormat('dd-MM-yyyy hh:mm a')
        // dt.payment_amount = dt.payment_amount + ' ' + dt.payment_currency
      }
      Excel.export(
        'Wallet Recharge Rejected',
        [
          { header: 'Ref. No', property: 'reference_number' },
          { header: 'Request', property: 'request_date_time' },
          { header: 'Agent Code', property: 'agent_code' },
          { header: 'Agent', property: 'recharge_for_name' },
          { header: 'Amount', property: 'recharge_amount' },
          { header: 'MOP', property: 'mop' },
          { header: 'Rejected By', property: 'rejected_by_name' },
          { header: 'Rejected Time', property: 'rejected_date_time' },
          { header: 'Remark', property: 'user_remark' },
        ],
        data.data, "Wallet Recharge Rejected", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]);
    });
  }

  ngOnDestroy() {
    if (this.settingsRejectSubscription) {
      this.settingsRejectSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
      }
  }


}
