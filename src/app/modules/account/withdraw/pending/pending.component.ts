import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe } from '@angular/common';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
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
import { Security, messages, module_name, withdrawPermissions } from 'app/security';
import { WalletService } from 'app/services/wallet.service';
import { WithdrawService } from 'app/services/withdraw.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { takeUntil, debounceTime, Subject } from 'rxjs';
import { InfoWithdrawComponent } from '../info-withdraw/info-withdraw.component';
import { EntityService } from 'app/services/entity.service';
import { ToasterService } from 'app/services/toaster.service';
import { MasterService } from 'app/services/master.service';
import { ReflectionInjector } from 'app/injector/reflection-injector';
import { RejectVisaPaxDialogComponent } from 'app/modules/booking/visa/visa-booking-details/reject-visapax-dialog/reject-visapax-dialog.component';
import { RejectResonComponent } from '../reject-reson/reject-reson.component';

@Component({
  selector: 'app-wpending',
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.scss'],
  styles: [`
  .tbl-grid {
    grid-template-columns: 40px 180px 110px 200px 150px 200px;
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
    MatSortModule
  ],
})
export class WPendingComponent {

  @ViewChild('tabGroup') tabGroup;
  @ViewChild(MatPaginator) public _paginatorPending: MatPaginator;
  @ViewChild(MatSort) public _sortPending: MatSort;
  searchInputControlPending = new FormControl('');

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
  filter: any = {}


  columns = [
    { key: 'entry_date_time', name: 'Date', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, tooltip: false },
    { key: 'withdraw_status', name: 'Status', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', is_sticky: false, align: '', indicator: false },
    { key: 'agent_name', name: 'Agent Name', is_date: false, date_formate: '', is_sortable: true, class: 'max-w-48 min-w-48', is_sticky: false, align: '', indicator: false, tooltip: true },
    { key: 'withdraw_amount', name: 'Amount', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', is_sticky: false, align: '', indicator: false },
    { key: 'agent_remark', name: 'Agent Remark', is_date: false, date_formate: '', is_sortable: true, class: 'truncate', is_sticky: false, align: '', indicator: false, tooltip: true },
  ]
  cols = [];
  protected masterService: MasterService;

  constructor(
    private withdrawService: WithdrawService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private alertService: ToasterService,
    private entityService: EntityService,
  ) {
    // super(module_name.wallet)
    this.cols = this.columns.map(x => x.key);
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
  }

  ngOnInit(): void {
    this.searchInputControlPending.valueChanges
      .subscribe(() => {
        GridUtils.resetPaginator(this._paginatorPending);
        this.refreshItemsPending();
      });
    this.refreshItemsPending();
  }

  view(record) {
    if (!Security.hasViewDetailPermission(module_name.wallet)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(InfoWithdrawComponent, {
      data: { data: record, readonly: true },
      disableClose: true
    })
  }

  Audit(data: any): void {
    if (!Security.hasPermission(withdrawPermissions.auditUnauditPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

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

  refreshItemsPending() {
    this.isLoading = true;
    const filterReq = GridUtils.GetFilterReq(
      this._paginatorPending,
      this._sortPending,
      this.searchInputControlPending.value, "entry_date_time", 1
    );

    filterReq['status'] = 'pending'
    filterReq['FromDate'] = DateTime.fromJSDate(new Date(this.filter.FromDate)).toFormat('yyyy-MM-dd')
    filterReq['ToDate'] = DateTime.fromJSDate(new Date(this.filter.ToDate)).toFormat('yyyy-MM-dd')
    filterReq['agent_id'] = this.filter?.agent_id == 'all' ? '' : this.filter?.agent_id;
    this.withdrawService.getWalletWithdrawList(filterReq).subscribe(
      {
        next: data => {
          this.isLoading = false;
          this.dataList = data.data;
          this.dataList.forEach(x => {
            x.withdraw_amount = x.withdraw_currency + " " + x.withdraw_amount
          })
          this._paginatorPending.length = data.total;
          this.total = data.total;
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

}
