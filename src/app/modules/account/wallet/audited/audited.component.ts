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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AppConfig } from 'app/config/app-config';
import { Security, filter_module_name, messages, module_name } from 'app/security';
import { MasterService } from 'app/services/master.service';
import { WalletService } from 'app/services/wallet.service';
import { Subject, Subscription } from 'rxjs';
import { InfoWalletComponent } from '../info-wallet/info-wallet.component';
import { DateTime } from 'luxon';
import { Excel } from 'app/utils/export/excel';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { AgentService } from 'app/services/agent.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
  selector: 'app-audited',
  templateUrl: './audited.component.html',
  styleUrls: ['./audited.component.scss'],
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
export class AuditedComponent extends BaseListingComponent {

  @ViewChild('tabGroup') tabGroup;
  @Input() isFilterShowAudit: boolean;
  @Input() filterApiData:any;
  @Input() activeTab: any;

  searchInputControlAudit = new FormControl('');
  filter_table_name = filter_module_name.wallet_recharge_audited;

  public key: any;
  public sortColumn: any;
  public sortDirection: any;
  Mainmodule: any;
  isLoading = false;
  public _unsubscribeAll: Subject<any> = new Subject<any>();

  module_name = module_name.wallet
  dataList = [];
  total = 0;
  appConfig = AppConfig;
  auditListFilter: any = {};
  agentList: any[] = [];
  pspList:any[] = [];
  mopList:any[] = [];
  selectedMop:any;
  selectedPsp:any;
  selectedEmployee:any;

  cols = [];

  protected masterService: MasterService;
  public settingsAuitedSubscription: Subscription;

  constructor(
    private walletService: WalletService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    public agentService: AgentService,
    public _filterService: CommonFilterService
  ) {
    super(module_name.wallet)
    this.key = this.module_name;
    this.sortColumn = 'request_date_time';
    this.sortDirection = 'desc';
    this.Mainmodule = this

    this.auditListFilter = {
      particularId: '',
      mop: '',
      psp: '',
      agency_name : '',
      FromDate: new Date(),
      ToDate: new Date(),
    };

    this.auditListFilter.FromDate.setDate(1);
    this.auditListFilter.FromDate.setMonth(this.auditListFilter.FromDate.getMonth());

  }

  ngOnInit(): void {

  }

  ngOnChanges() {
    if (this.activeTab == 'Audited') {
      this.settingsAuitedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {

        this.sortColumn = resp['sortColumn'];
        this.primengTable['_sortField'] = resp['sortColumn'];
        if (resp['table_config']['request_date_time'].value && resp['table_config']['request_date_time'].value.length) {
          this._filterService.rangeDateConvert(resp['table_config']['request_date_time']);
        }
        if (resp['table_config']['audited_date_time'].value) {
            resp['table_config']['audited_date_time'].value = new Date(resp['table_config']['audited_date_time'].value);
        }
        this.primengTable['filters'] = resp['table_config'];
        this.isFilterShowAudit = true;
        this.primengTable._filter();
      });

      // ngAfterViewInit
      if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
        this.isFilterShowAudit = true;
        let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
        if (filterData['table_config']['request_date_time'].value && filterData['table_config']['request_date_time'].value.length) {
          this._filterService.rangeDateConvert(filterData['table_config']['request_date_time']);
        }
        if (filterData['table_config']['audited_date_time'].value) {
            filterData['table_config']['audited_date_time'].value = new Date(filterData['table_config']['audited_date_time'].value);
        }

        this.primengTable['filters'] = filterData['table_config'];
      }
    }

    this.agentList = this.filterApiData?.agentData;
    this.mopList = this.filterApiData?.mopData;
    this.pspList = this.filterApiData?.pspData;

    // if (this.isFilterShowAudit) {
    //   this.getAgentList('');
    // }
  }

  getAgentList(value: string, bool=true) {
    this.agentService.getAgentComboMaster(value, bool).subscribe((data) => {
      this.agentList = data;

      for(let i in this.agentList){
        this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`
      }
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
              this.refreshItemsAudited()
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
              this.refreshItemsAudited()
            }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
          });
        }
      }
    })
  }


  refreshItemsAudited(event?: any) {

    this.isLoading = true;

    const filterReq = this.getNewFilterReq(event);
    filterReq['Filter'] = this.searchInputControlAudit.value;
    filterReq['Status'] = 'audited';
    filterReq['particularId'] = this.auditListFilter?.particularId == "all" ? '' : this.auditListFilter?.particularId;
    filterReq['mop'] = this.auditListFilter?.mop || '';
    filterReq['psp'] = this.auditListFilter?.psp || '';
    filterReq['FromDate'] = DateTime.fromJSDate(new Date(this.auditListFilter.FromDate)).toFormat('yyyy-MM-dd');
    filterReq['ToDate'] = DateTime.fromJSDate(new Date(this.auditListFilter.ToDate)).toFormat('yyyy-MM-dd');

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

  getNodataTextAudited(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControlAudit.value)
      return `no search results found for \'${this.searchInputControlAudit.value}\'.`;
    else return 'No data to display';
  }

  exportExcel(): void {
    if (!Security.hasExportDataPermission(this.module_name)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const filterReq = this.getNewFilterReq({});
    filterReq['Filter'] = this.searchInputControlAudit.value;
    filterReq['Status'] = 'audited';
    filterReq['particularId'] = this.auditListFilter?.particularId == "all" ? '' : this.auditListFilter?.particularId;
    filterReq['mop'] = this.auditListFilter?.mop || '';
    filterReq['psp'] = this.auditListFilter?.psp || '';
    filterReq['FromDate'] = DateTime.fromJSDate(new Date(this.auditListFilter.FromDate)).toFormat('yyyy-MM-dd');
    filterReq['ToDate'] = DateTime.fromJSDate(new Date(this.auditListFilter.ToDate)).toFormat('yyyy-MM-dd');
    filterReq['Take'] = this.totalRecords;


    this.walletService.getWalletRechargeFilterList(filterReq).subscribe(data => {
      for (var dt of data.data) {
        dt.audited_date_time = DateTime.fromISO(dt.audited_date_time).toFormat('dd-MM-yyyy hh:mm a')
        dt.request_date_time = DateTime.fromISO(dt.request_date_time).toFormat('dd-MM-yyyy hh:mm a')
        // dt.payment_amount = dt.payment_amount + ' ' + dt.payment_currency
      }
      Excel.export(
        'Wallet Recharge Audited',
        [
          { header: 'Ref. No', property: 'reference_number' },
          { header: 'Request', property: 'request_date_time' },
          { header: 'Agent Code', property: 'agent_code' },
          { header: 'Agent', property: 'recharge_for_name' },
          { header: 'Amount', property: 'recharge_amount' },
          { header: 'Settled Amount', property: 'settled_amount' },
          { header: 'MOP', property: 'mop' },
          { header: 'PSP', property: 'psp_name' },
          { header: 'PSP Ref No.', property: 'psp_ref_number' },
          { header: 'Audit By', property: 'audited_by_name' },
          { header: 'Audit Time', property: 'audited_date_time' },
          { header: 'Remark', property: 'user_remark' },
        ],
        data.data, "Wallet Recharge Audited", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }]);
    });
  }

  ngOnDestroy() {
    if (this.settingsAuitedSubscription) {
      this.settingsAuitedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
      }
  }

}
