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
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AppConfig } from 'app/config/app-config';
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { Security, filter_module_name, messages, module_name } from 'app/security';
import { MasterService } from 'app/services/master.service';
import { WithdrawService } from 'app/services/withdraw.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { Subject, Subscription } from 'rxjs';
import { InfoWithdrawComponent } from '../info-withdraw/info-withdraw.component';
import { EntityService } from 'app/services/entity.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentService } from 'app/services/agent.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { UserService } from 'app/core/user/user.service';
import { IndianNumberPipe } from '@fuse/pipes/indianNumberFormat.pipe';
import { OverlayPanel } from 'primeng/overlaypanel';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-waudited',
  templateUrl: './audited.component.html',
  styleUrls: ['./audited.component.scss'],
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
    MatSortModule,
    InfoWithdrawComponent,
    PrimeNgImportsModule,
    IndianNumberPipe
  ],
})
export class WAuditedComponent extends BaseListingComponent {
  @ViewChild('op') overlayPanel!: OverlayPanel;
  @Input() isFilterShowAudit: boolean;
  @Output() isFilterShowAuditedChange = new EventEmitter<boolean>();

  searchInputControlAudit = new FormControl('');
  public withdrawAuitedSubscription: Subscription;
  Mainmodule: any;
  isLoading = false;
  public _unsubscribeAll: Subject<any> = new Subject<any>();
  public key: any;
  public sortColumn: any;
  public sortDirection: any;

  module_name = module_name.wallet;
  filter_table_name = filter_module_name.withdraw_audited;

  dataList = [];
  total = 0;
  appConfig = AppConfig;
  data: any
  filter: any = {};
  agentList: any[] = [];
  selectedEmployee: any;
  withdrawList = [
    { label: 'Deduction', value: 'Deduction' },
    { label: 'Bank Withdraw', value: 'Bank Withdraw' },
  ];

  types = Types;
  selectedColumns: Column[] = [];
  exportCol: Column[] = [];
  activeFiltData: any = {};
  cols: Column[] = [];

  protected masterService: MasterService;
  searchInputControlConverted: any;

  constructor(
    private withdrawService: WithdrawService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    public agentService: AgentService,
    private entityService: EntityService,
    public _filterService: CommonFilterService,
    private _userService: UserService,
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

    this.selectedColumns = [

      { field: 'withdraw_ref_no', header: 'Ref. No.', type: Types.text },
      { field: 'entry_date_time', header: 'Date', type: Types.dateTime, dateFormat: 'dd-MM-yyyy HH:mm:ss' },
      { field: 'withdraw_amount', header: 'Amount', type: Types.number, fixVal: 0, class: 'text-right' },
      { field: 'agent_Code', header: 'Agent Code', type: Types.number, fixVal: 0 },
      { field: 'agent_name', header: 'Agency Name', type: Types.select },
      { field: 'account_number', header: 'Bank', type: Types.link },
      { field: 'withdraw_type', header: 'Withdraw Type', type: Types.select },
    ];

    this.cols.unshift(...this.selectedColumns);
    this.exportCol = cloneDeep(this.cols);
  }

  ngOnInit(): void {
    this.agentList = this._filterService.agentListById;

    this._filterService.updateSelectedOption('');
    this.withdrawAuitedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      this._filterService.updateSelectedOption('');
      // this.sortColumn = resp['sortColumn'];
      // this.primengTable['_sortField'] = resp['sortColumn'];
      this.selectedEmployee = resp['table_config']['agent_id_filters']?.value;
      if (this.selectedEmployee && this.selectedEmployee.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedEmployee?.id);
        if (!match) {
          this.agentList.push(this.selectedEmployee);
        }
      }
      if (resp['table_config']['entry_date_time']?.value && Array.isArray(resp['table_config']['entry_date_time']?.value)) {
        this._filterService.selectionDateDropdown = 'custom_date_range';
        this._filterService.rangeDateConvert(resp['table_config']['entry_date_time']);
      }
      this.primengTable['filters'] = resp['table_config'];
      this.isFilterShowAudit = true;
      this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns);
      this.isFilterShowAuditedChange.emit(this.isFilterShowAudit);
      this.primengTable._filter();
    });

  }

  ngAfterViewInit(): void {
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {

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
      this.isFilterShowAudit = true;
      this.isFilterShowAuditedChange.emit(this.isFilterShowAudit);

      if (filterData['table_config']['entry_date_time']?.value && Array.isArray(filterData['table_config']['entry_date_time']?.value)) {
        this._filterService.selectionDateDropdown = 'custom_date_range';
        this._filterService.rangeDateConvert(filterData['table_config']['entry_date_time']);
      }
      // this.primengTable['_sortField'] = filterData['sortColumn'];
      // this.sortColumn = filterData['sortColumn'];
      this.primengTable['filters'] = filterData['table_config'];
      this.selectedColumns = this.checkSelectedColumn(filterData['selectedColumns'] || [], this.selectedColumns);
      this.onColumnsChange();
    } else {
      this.selectedColumns = this.checkSelectedColumn([], this.selectedColumns);
      this.onColumnsChange();
    }

  }

  onColumnsChange(): void {
    this._filterService.setSelectedColumns({ name: this.filter_table_name, columns: this.selectedColumns });
  }

  checkSelectedColumn(col: any[], oldCol: Column[]): any[] {
    if (col.length) return col
    else {
      var Col = this._filterService.getSelectedColumns({ name: this.filter_table_name })?.columns || [];
      if (!Col.length)
        return oldCol;
      else
        return Col;
    }
  }

  isDisplayHashCol(): boolean {
    return this.selectedColumns.length > 0;
  }


  toggleOverlayPanel(event: MouseEvent) {
    this.overlayPanel.toggle(event);
  }

  getAgentList(value: string) {
    this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
      this.agentList = data;

      for (let i in this.agentList) {
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

    this.entityService.raisebankDetailsCall({ data: record, title: 'Bank Info' })

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

          const executeMethod = () => {
            this.withdrawService.setWithdrawAudit(data.id).subscribe({
              next: () => {
                this.alertService.showToast('success', "Wallet Withdraw Audited", "top-right", true);
                // this.refreshItemsAudited(this.data)
              }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
            });
          }

          // Method to execute a function after verifying OTP if needed
          this._userService.verifyAndExecute(
            { title: 'account_withdraw_audit' },
            () => executeMethod()
          );
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

          const executeMethod = () => {
            this.withdrawService.setWithdrawReject(record.id).subscribe({
              next: () => {
                this.alertService.showToast('success', "Wallet Withdraw Audited", "top-right", true);
                this.refreshItemsAudited()
                this.entityService.raiseWithdrawRejectedCall(record.id);
              }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
            });
          }

          // Method to execute a function after verifying OTP if needed
          this._userService.verifyAndExecute(
            { title: 'account_withdraw_reject' },
            () => executeMethod()
          );
        }
      }
    })
  }

  refreshItemsAudited(event?: any) {
    this.isLoading = true;

    const filterReq = this.getNewFilterReq(event);
    filterReq['Filter'] = this.searchInputControlAudit.value;
    filterReq['status'] = 'audited';
    // filterReq['FromDate'] = DateTime.fromJSDate(new Date(this.filter.FromDate)).toFormat('yyyy-MM-dd')
    // filterReq['ToDate'] = DateTime.fromJSDate(new Date(this.filter.ToDate)).toFormat('yyyy-MM-dd')
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
          this.totalRecords = data.total;
        }, error: err => {
          this.alertService.showToast('error', err);
          this.isLoading = false;
        }
      }
    );
  }

  getNodataTextAudited(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControlAudit.value)
      return `no search results found for \'${this.searchInputControlAudit.value}\'.`;
    else return 'No data to display';
  }

  ngOnDestroy() {
    if (this.withdrawAuitedSubscription) {
      this.withdrawAuitedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }


  displayColCount(): number {
    return this.selectedColumns.length + 1;
  }

  isValidDate(value: any): boolean {
    const date = new Date(value);
    return value && !isNaN(date.getTime());

  }

}
