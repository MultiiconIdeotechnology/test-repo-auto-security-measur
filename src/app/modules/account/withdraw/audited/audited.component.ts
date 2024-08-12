import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Input, OnDestroy, ViewChild } from '@angular/core';
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
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, messages, module_name } from 'app/security';
import { MasterService } from 'app/services/master.service';
import { ToasterService } from 'app/services/toaster.service';
import { WithdrawService } from 'app/services/withdraw.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { takeUntil, debounceTime, Subject } from 'rxjs';
import { InfoWithdrawComponent } from '../info-withdraw/info-withdraw.component';
import { EntityService } from 'app/services/entity.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentService } from 'app/services/agent.service';

@Component({
  selector: 'app-waudited',
  templateUrl: './audited.component.html',
  styleUrls: ['./audited.component.scss'],
  styles: [`
  .tbl-grid {
    grid-template-columns: 40px 170px 140px 110px 204px 210px;
  }
  `],
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
export class WAuditedComponent extends BaseListingComponent {

  @ViewChild('tabGroup') tabGroup;
  @Input() isFilterShowAudit: boolean;
  @Input() agentData:any;


  @ViewChild(MatPaginator) public _paginatorPending: MatPaginator;
  @ViewChild(MatSort) public _sortPending: MatSort;
  searchInputControlAudit = new FormControl('');

  Mainmodule: any;
  isLoading = false;
  public _unsubscribeAll: Subject<any> = new Subject<any>();
  public key: any;
  public sortColumn: any;
  public sortDirection: any;

  module_name = module_name.wallet
  dataList = [];
  total = 0;
  appConfig = AppConfig;
  data: any
  filter: any = {};
  agentList: any[] = [];

  withdrawList = [
    { label: 'Deduction', value: 'Deduction' },
    { label: 'Bank Withdraw', value: 'Bank Withdraw' },
  ];

  columns = [
    { key: 'withdraw_ref_no', name: 'Ref No.', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false },
    { key: 'entry_date_time', name: 'Date', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, tooltip: false },
    { key: 'withdraw_amount', name: 'Amount', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', is_sticky: false, align: '', indicator: false },
    { key: 'agent_Code', name: 'Agent Code', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false },
    { key: 'agent_name', name: 'Agency Name', is_date: false, date_formate: '', is_sortable: true, class: 'max-w-48 min-w-48', is_sticky: false, align: '', indicator: false, tooltip: true },
    { key: 'account_number', name: 'Bank', is_date: false, is_info: true, date_formate: '', is_sortable: true, class: 'truncate', is_sticky: false, align: '', indicator: true, tooltip: true },

  ]
  cols = [];

  protected masterService: MasterService;
  searchInputControlConverted: any;

  constructor(
    private withdrawService: WithdrawService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    public agentService: AgentService,
    private entityService: EntityService,
  ) {
    super(module_name.withdraw)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'agent_name';
    this.sortDirection = 'asc';
    this.Mainmodule = this

    this.filter = {
      agent_id: 'all',
      FromDate: new Date(),
      ToDate: new Date(),
    };

    this.filter.FromDate.setDate(1);
    this.filter.FromDate.setMonth(this.filter.FromDate.getMonth());
  }

  ngOnInit(): void {
    // this.entityService.onWithdrawAuditedCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
    //   next: (item) => {
    //     this.refreshItemsAudited();
    //   }
    // })
    this.searchInputControlAudit.valueChanges
      .subscribe(() => {
        // GridUtils.resetPaginator(this._paginatorPending);
        // this.refreshItemsAudited();
      });
  }

  ngOnChanges() {
    this.agentList = this.agentData;
    // if (this.isFilterShowAudit) {
    //   this.getAgentList('');
    // }
  }

  getAgentList(value: string) {
      this.agentService.getAgentCombo(value).subscribe((data) => {
        this.agentList = data;
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
          this.withdrawService.setWithdrawAudit(data.id).subscribe({
            next: () => {
              this.alertService.showToast('success', "Wallet Withdraw Audited", "top-right", true);
              // this.refreshItemsAudited(this.data)
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
              this.refreshItemsAudited()
              this.entityService.raiseWithdrawRejectedCall(record.id);
            }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
          });
        }
      }
    })
  }

  refreshItemsAudited(event?: any) {
    this.isLoading = true;
    // const filterReq = GridUtils.GetFilterReq(
    //   this._paginatorPending,
    //   this._sortPending,
    //   this.searchInputControlAudit.value, "entry_date_time", 1
    // );
    const filterReq = this.getNewFilterReq(event);
    filterReq['Filter'] = this.searchInputControlAudit.value;
    filterReq['status'] = 'audited';
    filterReq['FromDate'] = DateTime.fromJSDate(new Date(this.filter.FromDate)).toFormat('yyyy-MM-dd')
    filterReq['ToDate'] = DateTime.fromJSDate(new Date(this.filter.ToDate)).toFormat('yyyy-MM-dd')
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

  // ngOnDestroy(): void {
  //   this._unsubscribeAll.next(null);
  //   this._unsubscribeAll.complete();
  // }

}
