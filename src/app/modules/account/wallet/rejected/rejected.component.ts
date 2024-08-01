import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
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
import { ToasterService } from 'app/services/toaster.service';
import { WalletService } from 'app/services/wallet.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { Subject, takeUntil } from 'rxjs';
import { InfoWalletComponent } from '../info-wallet/info-wallet.component';
import { DateTime } from 'luxon';
import { EntityService } from 'app/services/entity.service';
import { Excel } from 'app/utils/export/excel';

@Component({
  selector: 'app-rejected',
  templateUrl: './rejected.component.html',
  styleUrls: ['./rejected.component.scss'],
  styles: [`
  .tbl-grid {
    grid-template-columns: 40px 200px 180px 180px 130px 160px 190px 180px 200px;
  }
  `],
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
    MatTabsModule

  ],
})
export class RejectedComponent {

  @ViewChild('tabGroup') tabGroup;
  @ViewChild(MatPaginator) public _paginatorPending: MatPaginator;
  @ViewChild(MatSort) public _sortPending: MatSort;
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

  columns = [
    { key: 'reference_number', name: 'Ref. No', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, tooltip: true },
    { key: 'request_date_time', name: 'Request', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false },
    { key: 'recharge_for_name', name: 'Agent', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, tooltip: true },
    { key: 'recharge_amount', name: 'Amount', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', is_sticky: false, align: '', indicator: false },
    { key: 'mop', name: 'MOP', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false },
    { key: 'filename', name: 'Attachment', is_date: false, date_formate: '', is_sortable: false, class: 'header-center-view', is_sticky: false, align: '', indicator: false, isicon: true },
    { key: 'rejected_by_name', name: 'Rejected By', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false },
    { key: 'rejected_date_time', name: 'Reject Time', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false },

  ]
  cols = [];
  protected masterService: MasterService;

  constructor(
    private walletService: WalletService,
    private conformationService: FuseConfirmationService,
    private alertService: ToasterService,
    private matDialog: MatDialog,
    private entityService: EntityService,
  ) {
    // super(module_name.wallet)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'recharge_for_name';
    this.sortDirection = 'asc';
    this.Mainmodule = this

  }

  ngOnInit(): void {
    this.searchInputControlRejected.valueChanges
      .subscribe(() => {
        GridUtils.resetPaginator(this._paginatorPending);
        this.refreshItemsRejected();
      });

    this.entityService.onWalletRejectedCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (item) => {
        this.refreshItemsRejected();
      }
    })
  }

  view(record) {
    if (!Security.hasViewDetailPermission(module_name.wallet)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(InfoWalletComponent, {
      data: { data: record, readonly: true },
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

  refreshItemsRejected() {

    this.isLoading = true;
    const filterReq = GridUtils.GetFilterReq(
      this._paginatorPending,
      this._sortPending,
      this.searchInputControlRejected.value, "request_date_time", 1
    );

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
          this.dataList.forEach(x => {
            x.recharge_amount = x.currency + " " + x.recharge_amount
          });
          this._paginatorPending.length = data.total;
          this.total = data.total;
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

  exportExcel(): void {
    if (!Security.hasExportDataPermission(this.module_name)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    const filterReq = GridUtils.GetFilterReq(
      this._paginatorPending,
      this._sortPending,
      this.searchInputControlRejected.value, "request_date_time", 1
    );

    filterReq['Status'] = 'rejected';
    filterReq['particularId'] = this.rejectFilter?.particularId == "all" ? '' : this.rejectFilter?.particularId;
    filterReq['mop'] = this.rejectFilter?.mop || '';
    filterReq['psp'] = this.rejectFilter?.psp || '';
    filterReq['FromDate'] = DateTime.fromJSDate(new Date(this.rejectFilter.FromDate)).toFormat('yyyy-MM-dd');
    filterReq['ToDate'] = DateTime.fromJSDate(new Date(this.rejectFilter.ToDate)).toFormat('yyyy-MM-dd');
    filterReq['Skip'] = 0;
    filterReq['Take'] = this._paginatorPending.length;

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
          { header: 'Agent', property: 'recharge_for_name' },
          { header: 'Amount', property: 'recharge_amount' },
          { header: 'MOP', property: 'mop' },
          { header: 'Rejected By', property: 'rejected_by_name' },
          { header: 'Rejected Time', property: 'rejected_date_time' },
        ],
        data.data, "Wallet Recharge Rejected", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }]);
    });
  }


}
