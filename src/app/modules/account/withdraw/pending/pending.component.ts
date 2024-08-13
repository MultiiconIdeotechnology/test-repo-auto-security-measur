import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AppConfig } from 'app/config/app-config';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, filter_module_name, messages, module_name, withdrawPermissions } from 'app/security';
import { WithdrawService } from 'app/services/withdraw.service';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { takeUntil, Subject, Subscription } from 'rxjs';
import { InfoWithdrawComponent } from '../info-withdraw/info-withdraw.component';
import { EntityService } from 'app/services/entity.service';
import { MasterService } from 'app/services/master.service';
import { ReflectionInjector } from 'app/injector/reflection-injector';
import { RejectResonComponent } from '../reject-reson/reject-reson.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { MatMenuModule } from '@angular/material/menu';
import { AgentService } from 'app/services/agent.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
  selector: 'app-wpending',
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.scss'],
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
    MatMenuModule,
    MatTooltipModule,
    InfoWithdrawComponent,
    PrimeNgImportsModule,
  ],
})
export class WPendingComponent extends BaseListingComponent implements OnChanges {

  @ViewChild('tabGroup') tabGroup;
  @Input() isFilterShowPending: boolean;
  @Input() activeTab:any;

  searchInputControlPending = new FormControl('');
  filter_table_name = filter_module_name.withdraw_pending;

  Mainmodule: any;
  isLoading = false;
  public _unsubscribeAll: Subject<any> = new Subject<any>();
  public key: any;
  public sortColumn: any;
  public sortDirection: any;
  public withdrawUpdatedSubscription: Subscription;

  module_name = module_name.wallet
  dataList = [];
  total = 0;
  appConfig = AppConfig;
  data: any
  filter: any = {}
  agentList: any[] = [];

  cols = [];

  protected masterService: MasterService;

  constructor(
    private withdrawService: WithdrawService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    public agentService: AgentService,
    private entityService: EntityService,
    public _filterService: CommonFilterService
  ) {
    super(module_name.withdraw)
    this.key = this.module_name;
    this.sortColumn = 'entry_date_time';
    this.sortDirection = 'desc';
    this.Mainmodule = this

    this.masterService = ReflectionInjector.get(MasterService);

    this.filter = {
      agent_id: 'all',
      FromDate: new Date(),
      ToDate: new Date(),
    };

    this.filter.FromDate.setDate(1);
    this.filter.FromDate.setMonth(this.filter.FromDate.getMonth());
    this._filterService.applyDefaultFilter(this.filter_table_name);
    this.entityService.onrefreshbankDetailsCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (item) => {
        this.refreshItemsPending()
      }
    })
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      this.isFilterShowPending = true;
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      if (filterData['table_config']['entry_date_time'].value && filterData['table_config']['entry_date_time'].value.length) {
        this._filterService.rangeDateConvert(filterData['table_config']['entry_date_time']);
      }

      this.primengTable['filters'] = filterData['table_config'];
    }
  }

  ngOnChanges() {
    
    if(this.activeTab == 'Pending') {
      this.withdrawUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
        
        this.sortColumn = resp['sortColumn'];
        this.primengTable['_sortField'] = resp['sortColumn'];
        if (resp['table_config']['entry_date_time'].value && resp['table_config']['entry_date_time'].value.length) {
          this._filterService.rangeDateConvert(resp['table_config']['entry_date_time']);
        }
        this.primengTable['filters'] = resp['table_config'];
        this.isFilterShowPending = true;
        this.primengTable._filter();
      });
    }

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

    this.entityService.raisebankDetailsCall({ data: record, send: 'Info' })

    // this.matDialog.open(InfoWithdrawComponent, {
    //   data: { data: record, readonly: true, send: 'Bank' },
    //   disableClose: true
    // })
  }

  Audit(data: any): void {
    if (!Security.hasPermission(withdrawPermissions.auditUnauditPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    if (data.bank_audit) {
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
                this.refreshItemsPending()
                this.entityService.raiseWithdrawAuditedCall(data.id);
              }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
            });
          }
        }
      })
    }
    else {
      this.entityService.raisebankDetailsCall({ data: data, send: 'Audit' })

    }
  }

  Reject(record: any): void {
    if (!Security.hasPermission(withdrawPermissions.rejectPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    // const label: string = 'Reject Wallet Withdraw'
    // this.conformationService.open({
    //   title: label,
    //   message: 'Are you sure to ' + label.toLowerCase() + ' ?'
    // }).afterClosed().subscribe({
    //   next: (res) => {
    //     if (res === 'confirmed') {
    //       this.withdrawService.setWithdrawReject(record.id).subscribe({
    //         next: () => {
    //           this.alertService.showToast('success', "Wallet Withdraw Rejected", "top-right", true);
    //           this.refreshItemsPending();
    //           this.entityService.raiseWithdrawRejectedCall(record.id);
    //         }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
    //       });
    //     }
    //   }
    // })

    this.matDialog.open(RejectResonComponent, {
      data: null,
      disableClose: true,
    })
      .afterClosed().subscribe({
        next: (res) => {
          if (res) {
            const json = {
              id: record.id,
              reject_reason: res?.reject_reason
            }
            this.withdrawService.setWithdrawReject(json).subscribe({
              next: (res: any) => {
                if (res) {
                  this.alertService.showToast('success', 'Wallet Withdraw Rejected!');
                  this.refreshItemsPending()

                }
              }, error: err => {
                this.alertService.showToast('error', err);
              }
            })
          }
        }
      });
  }

  refreshItemsPending(event?: any) {
    this.isLoading = true;
    const filterReq = this.getNewFilterReq(event);
    filterReq['status'] = 'pending';
    filterReq['Filter'] = this.searchInputControlPending.value;
    filterReq['FromDate'] = DateTime.fromJSDate(new Date(this.filter.FromDate)).toFormat('yyyy-MM-dd');
    filterReq['ToDate'] = DateTime.fromJSDate(new Date(this.filter.ToDate)).toFormat('yyyy-MM-dd');
    filterReq['agent_id'] = this.filter?.agent_id == 'all' ? '' : this.filter?.agent_id;
    this.withdrawService.getWalletWithdrawList(filterReq).subscribe(
      {
        next: data => {
          this.isLoading = false;
          this.dataList = data.data;
          // this.dataList.forEach(x => {
          //   x.withdraw_amount = x.currency_symbol + " " + x.withdraw_amount,
          //     x.account_number = x.account_number + " - " + x.bank_name
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

  getNodataTextPending(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControlPending.value)
      return `no search results found for \'${this.searchInputControlPending.value}\'.`;
    else return 'No data to display';
  }

  ngOnDestroy() {
    if (this.withdrawUpdatedSubscription) {
      this.withdrawUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }
}
