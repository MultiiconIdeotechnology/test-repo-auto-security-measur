import { Clipboard } from '@angular/cdk/clipboard';
import { NgIf, NgFor, DatePipe, CommonModule, NgClass } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabGroup, MatTab, MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterOutlet } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { dateRange } from 'app/common/const';
import { AppConfig } from 'app/config/app-config';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, messages, module_name } from 'app/security';
import { AccountService } from 'app/services/account.service';
import { ToasterService } from 'app/services/toaster.service';
import { CommonUtils } from 'app/utils/commonutils';
import { Excel } from 'app/utils/export/excel';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PaymentFilterComponent } from '../payment-filter/payment-filter.component';
import { PaymentInfoComponent } from '../payment-list/payment-info/payment-info.component';

@Component({
  selector: 'app-receipt-list',
  templateUrl: './receipt-list.component.html',
  styles: [`
  .tbl-grid {
    grid-template-columns: 40px 240px 200px 100px 140px 150px 101px 150px 180px 180px 150px 180px 100px;
}
  `],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    NgClass,
    RouterOutlet,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    MatTabsModule
  ],
})
export class ReceiptListComponent extends BaseListingComponent implements OnDestroy {

  module_name = module_name.receipts;
  isLoading = false;
  flashMessage: 'success' | 'error' | null = null;
  dataList = [];
  infoList = [];
  total = 0;
  public Filter: any;
  public key: any = "payment_request_date";
  appConfig = AppConfig;
  settings: any;
  currentFilter: any;

  constructor(
    private accountService: AccountService,
    private confirmService: FuseConfirmationService,
    private router: Router,
    private clipboard: Clipboard,
    private matDialog: MatDialog,
  ) {
    super(module_name.receipts)

    this.key = 'receipt_request_date';
    this.sortColumn = 'receipt_request_date';
    this.sortDirection = 'desc';
    this.Mainmodule = this;

    this.currentFilter = {
      status: 'All',
      payment_gateway: 'All',
      fromDate: new Date(),
      toDate: new Date(),

    }
    this.currentFilter.fromDate.setDate(1);
    this.currentFilter.fromDate.setMonth(this.currentFilter.fromDate.getMonth());
  }

  columns = [
    { key: 'transaction_ref_no', name: 'Transaction ID', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: true, is_boolean: false, tooltip: true, isview: true },
    { key: 'receipt_ref_no', name: 'Ref no.', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'receipt_status', name: 'Status', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', is_sticky: false, indicator: false, is_boolean: false, tooltip: true, iscolor: true },
    { key: 'receipt_from', name: 'From', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'service_for', name: 'For', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'payment_amount', name: 'Amount', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, isamount: true },
    { key: 'mode_of_payment', name: 'Mode of Payment', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'receipt_request_date', name: 'Requested', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'audit_date_time', name: 'Audited', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'agent_name', name: 'Agent', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'pg_payment_ref_no', name: 'PG Payment Ref.No.', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'pg_name', name: 'PG Name', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
  ]
  cols = [];

  ngOnInit(): void {
  }

  getFilter(): any {

    const filterReq = GridUtils.GetFilterReq(
      this._paginator,
      this._sort,
      this.searchInputControl.value
    );
    // const filter = this.currentFilter;
    filterReq['status'] = this.currentFilter.status;
    filterReq['payment_gateway'] = 'All';
    filterReq['fromDate'] = DateTime.fromJSDate(this.currentFilter.fromDate).toFormat('yyyy-MM-dd');
    filterReq['toDate'] = DateTime.fromJSDate(this.currentFilter.toDate).toFormat('yyyy-MM-dd')
    return filterReq;
  }

  filter(): void {
    this.matDialog.open(PaymentFilterComponent, {
      data: { data: this.currentFilter, name: 'Receipt filter' },
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.currentFilter = res;
        this.refreshItems();
      }
    })
  }

  viewInternal(data: any): void {
    this.matDialog.open(PaymentInfoComponent, {
      disableClose: true,
      data: { receipt: data }
    });
  }
 

  refreshItems(): void {
    this.isLoading = true;
    this.accountService.getReceiptList(this.getFilter()).subscribe({
      next: (data) => {
        this.dataList = data.data;
        this.total = data.total;
        this._paginator.length = data.total;
        this.isLoading = false;
      }, error: (err) => {
        this.alertService.showToast('error', err)
        this.isLoading = false
      }
    });
  }

  public show: boolean = false;
  public buttonName: any = 'Show';


  info(data: any): void {

    // only one show tab 
    // if(!data.show)
    // this.dataList.forEach(x => x.show = false)

    data.show = !data.show;
    this.infoList = [data]

    // Change the name of the button.
    if (this.show)
      this.buttonName = "Hide";
    else
      this.buttonName = "Show";
  }

  copyLink(link: string): void {
    this.clipboard.copy(link);
    this.alertService.showToast('success', 'Copied');
  }

  exportExcel(): void {
    if (!Security.hasExportDataPermission(this.module_name)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    // const filterReq = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value);
    // const req = Object.assign(filterReq);
    // const req = this.getFilter();
    // req.Skip = 0;
    // req.Take = this._paginator.length;
    const filterReq = {};

    filterReq['status'] = this.currentFilter.status;
    filterReq['fromDate'] = DateTime.fromJSDate(this.currentFilter.fromDate).toFormat('yyyy-MM-dd');
    filterReq['toDate'] = DateTime.fromJSDate(this.currentFilter.toDate).toFormat('yyyy-MM-dd')
    filterReq['Skip'] = 0;
    filterReq['Take'] = this._paginator.length;
    filterReq['OrderBy'] = 'receipt_request_date';
    filterReq['OrderDirection'] = 1;

    this.accountService.getReceiptList(filterReq).subscribe(data => {
      for (var dt of data.data) {
        dt.receipt_request_date = DateTime.fromISO(dt.receipt_request_date).toFormat('dd-MM-yyyy hh:mm a')
        dt.audit_date_time = DateTime.fromISO(dt.audit_date_time).toFormat('dd-MM-yyyy hh:mm a')
        dt.payment_amount = dt.payment_amount + ' ' + dt.payment_currency
      }
      Excel.export(
        'Receipt',
        [
          { header: 'Transaction ID', property: 'transaction_ref_no' },
          { header: 'Ref no.', property: 'receipt_ref_no' },
          { header: 'From', property: 'receipt_from' },
          { header: 'For', property: 'service_for' },
          { header: 'Amount', property: 'payment_amount' },
          { header: 'MOP', property: 'mode_of_payment' },
          { header: 'Requested', property: 'receipt_request_date' },
          { header: 'Audited', property: 'audit_date_time' },
          { header: 'Status', property: 'receipt_status' },
          { header: 'Agent', property: 'agent_name' },
          { header: 'PG Payment Ref.No.', property: 'pg_payment_ref_no' },
          { header: 'PG Name', property: 'pg_name' },
        ],
        data.data, "Receipt", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }]);
    });
  }


  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

}
