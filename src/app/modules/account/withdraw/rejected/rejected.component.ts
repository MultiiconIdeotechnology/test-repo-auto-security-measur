import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AppConfig } from 'app/config/app-config';
import { Security, filter_module_name, messages, module_name } from 'app/security';
import { MasterService } from 'app/services/master.service';
import { ToasterService } from 'app/services/toaster.service';
import { WithdrawService } from 'app/services/withdraw.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { takeUntil, debounceTime, Subject, Subscription } from 'rxjs';
import { InfoWithdrawComponent } from '../info-withdraw/info-withdraw.component';
import { EntityService } from 'app/services/entity.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { AgentService } from 'app/services/agent.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
  selector: 'app-wrejected',
  templateUrl: './rejected.component.html',
  styleUrls: ['./rejected.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    AsyncPipe,
    NgxMatSelectSearchModule,
    NgxMatTimepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatTabsModule,
    MatPaginatorModule,
    MatSortModule,
    InfoWithdrawComponent,
    PrimeNgImportsModule,
  ],
})
export class WRejectedComponent extends BaseListingComponent {
  @Input() isFilterShowReject: boolean;
  @Output() isFilterShowRejectedChange = new EventEmitter<boolean>();

  searchInputControlRejected = new FormControl('');
  public withdrawRejectSubscription: Subscription;
  Mainmodule: any;
  isLoading = false;
  public _unsubscribeAll: Subject<any> = new Subject<any>();
  public key: any;
  public sortColumn: any;
  public sortDirection: any;

  module_name = module_name.wallet;
  filter_table_name = filter_module_name.withdraw_rejected;
  dataList = [];
  total = 0;
  appConfig = AppConfig;
  data: any;
  filter: any = {};
  agentList: any[] = [];
  selectedEmployee:any;

  withdrawList = [
    { label: 'Deduction', value: 'Deduction' },
    { label: 'Bank Withdraw', value: 'Bank Withdraw' },
  ];

  cols = [];
  protected masterService: MasterService;

  constructor(
    private withdrawService: WithdrawService,
    private conformationService: FuseConfirmationService,
    public agentService: AgentService,
    private entityService: EntityService,
    public _filterService: CommonFilterService
  ) {
    super(module_name.withdraw)
    this.key = this.module_name;
    this.sortColumn = 'entry_date_time';
    this.sortDirection = 'asc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);
    this.filter = {
      agent_id: 'all',
      FromDate: new Date(),
      ToDate: new Date(),
    };

    this.filter.FromDate.setDate(1);
    this.filter.FromDate.setMonth(this.filter.FromDate.getMonth());

    this.entityService.onrefreshbankDetailsCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (item) => {
        this.refreshItemsRejected()
      }
    })
  }

  ngOnInit(): void {
    this.agentList = this._filterService.agentListById;

    this._filterService.selectionDateDropdown = "";
    this.withdrawRejectSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      this._filterService.selectionDateDropdown = "";
      // this.sortColumn = resp['sortColumn'];
      // this.primengTable['_sortField'] = resp['sortColumn'];
      this.selectedEmployee = resp['table_config']['agent_id_filters']?.value;
      if (this.selectedEmployee && this.selectedEmployee.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedEmployee?.id);
        if (!match) {
          this.agentList.push(this.selectedEmployee);
        }
      }
      if (resp['table_config']['entry_date_time'].value && resp['table_config']['entry_date_time'].value.length) {
        this._filterService.selectionDateDropdown = 'Custom Date Range';
        this._filterService.rangeDateConvert(resp['table_config']['entry_date_time']);
      }
   
      this.primengTable['filters'] = resp['table_config'];
      this.isFilterShowReject = true;
      this.isFilterShowRejectedChange.emit(this.isFilterShowReject);
      this.primengTable._filter();
    });
  }

  ngAfterViewInit(): void {
       if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
        this.isFilterShowReject = true;
        this.isFilterShowRejectedChange.emit(this.isFilterShowReject);
        let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
        setTimeout(() => {
          this.selectedEmployee = filterData['table_config']['agent_id_filters']?.value;
          if (this.selectedEmployee && this.selectedEmployee.id) {
            const match = this.agentList.find((item: any) => item.id == this.selectedEmployee?.id);
            if (!match) {
              this.agentList.push(this.selectedEmployee);
            }
          }
        }, 1000);
        if (filterData['table_config']['entry_date_time'].value && filterData['table_config']['entry_date_time'].value.length) {
          this._filterService.selectionDateDropdown = 'Custom Date Range';
          this._filterService.rangeDateConvert(filterData['table_config']['entry_date_time']);
        }

        this.primengTable['filters'] = filterData['table_config'];
        // this.primengTable['_sortField'] = filterData['sortColumn'];
        // this.sortColumn = filterData['sortColumn'];
      }
  }

  getAgentList(value: string) {
      this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
        this.agentList = data;

        for(let i in this.agentList){
          this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`
        }
      })
  }

  view(record) {
    if (!Security.hasViewDetailPermission(module_name.wallet)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.entityService.raiseInfoWithdraw({ data: record.id })


    // this.matDialog.open(InfoWithdrawComponent, {
    //   data: { data: record, readonly: true, send: 'Info' },
    //   disableClose: true
    // })
  }

  bankDetails(record) {
    if (!Security.hasViewDetailPermission(module_name.wallet)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.entityService.raisebankDetailsCall({ data: record, send: 'Info' })


    // this.matDialog.open(InfoWithdrawComponent, {
    //   data: { data: record, readonly: true, send: 'Bank' },
    //   disableClose: true
    // })
  }

  Audit(data: any): void {
    const label: string = 'Audit Wallet Withdraw'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ?'
    }).afterClosed().subscribe({
      next: (res) => {
        if (res === 'confirmed') {
          this.withdrawService.setWithdrawAudit(data.id).subscribe({
            next: () => {
              this.alertService.showToast('success', "Wallet Withdraw Audited", "top-right", true);
              this.refreshItemsRejected()
              this.entityService.raiseWithdrawAuditedCall(data.id);
            }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
          });
        }
      }
    })
  }

  Reject(record: any): void {
    const label: string = 'Reject Wallet Withdraw'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ?'
    }).afterClosed().subscribe({
      next: (res) => {
        if (res === 'confirmed') {
          this.withdrawService.setWithdrawReject(record.id).subscribe({
            next: () => {
              this.alertService.showToast('success', "Wallet Withdraw Audited", "top-right", true);
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
    filterReq['status'] = 'rejected';
    filterReq['FromDate'] = "";
    filterReq['ToDate'] = "";
    filterReq['agent_id'] = this.filter?.agent_id == 'all' ? '' : this.filter?.agent_id;
    this.withdrawService.getWalletWithdrawList(filterReq).subscribe(
      {
        next: data => {
          this.isLoading = false;
          this.dataList = data.data;
          // this.dataList.forEach(x => {
          //   x.withdraw_amount = x.withdraw_currency + " " + x.withdraw_amount
          //   x.account_number = x.account_number + " - " + x.bank_name

          // })
          // this._paginatorPending.length = data.total;
          // this.total = data.total;
          this.totalRecords = data.total;

        }, error: err => {
          this.alertService.showToast('error', err, "top-right", true)
          this.isLoading = false;
        }
      }
    );
  }

  getNodataTextRejected(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControlRejected.value)
      return `no search results found for \'${this.searchInputControlRejected.value}\'.`;
    else return 'No data to display';
  }

  ngOnDestroy(): void {
    if (this.withdrawRejectSubscription) {
      this.withdrawRejectSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }
  
}
