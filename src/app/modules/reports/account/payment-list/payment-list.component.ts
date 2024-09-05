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
import { AppConfig } from 'app/config/app-config';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { Security, filter_module_name, messages, module_name } from 'app/security';
import { AccountService } from 'app/services/account.service';
import { EmailSetupService } from 'app/services/email-setup.service';
import { ToasterService } from 'app/services/toaster.service';
import { Excel } from 'app/utils/export/excel';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PaymentFilterComponent } from '../payment-filter/payment-filter.component';
import { PaymentInfoComponent } from './payment-info/payment-info.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styles: [`
  .tbl-grid {
    grid-template-columns: 40px 240px 200px 100px 250px 150px 110px 150px 180px 180px;
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
    MatTabsModule,
    PrimeNgImportsModule
  ],
})
export class PaymentListComponent extends BaseListingComponent implements OnDestroy {

  module_name = module_name.payment;
  filter_table_name = filter_module_name.account_payments;
  private settingsUpdatedSubscription: Subscription;
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
  cols: any = [
    { field: 'payment_reject_reason', header: 'Payment Reject Reason' },
    { field: 'payment_type', header: 'Payment Type' },
  ];
  _selectedColumns: Column[];
  isFilterShow: boolean = false;
  selectedStatus: string;
  statusList = [
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Pending', value: 'Pending' },
  ];

  constructor(
    private accountService: AccountService,
    private matDialog: MatDialog,
    private clipboard: Clipboard,
    public _filterService: CommonFilterService
  ) {
    super(module_name.payment)
    this.key = 'payment_request_date';
    this.sortColumn = 'payment_request_date';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);

    this.currentFilter = {
      status: 'All',
      fromDate: new Date(),
      toDate: new Date(),

    }
    this.currentFilter.fromDate.setDate(1);
    this.currentFilter.fromDate.setMonth(this.currentFilter.fromDate.getMonth());
  }

  ngOnInit() {
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
      // this.sortColumn = resp['sortColumn'];
      // this.primengTable['_sortField'] = resp['sortColumn'];
      if (resp['table_config']['payment_request_date']?.value != null && resp['table_config']['payment_request_date'].value.length) {
        this._filterService.rangeDateConvert(resp['table_config']['payment_request_date']);
      }
      if (resp['table_config']['audit_date_time']?.value != null) {
        resp['table_config']['audit_date_time'].value = new Date(resp['table_config']['audit_date_time'].value);
      }
      this.primengTable['filters'] = resp['table_config'];
      this._selectedColumns = resp['selectedColumns'] || [];
      this.isFilterShow = true;
      this.primengTable._filter();
    });
  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      if (filterData['table_config']['payment_request_date']?.value != null && filterData['table_config']['payment_request_date'].value.length) {
        this._filterService.rangeDateConvert(filterData['table_config']['payment_request_date']);
      }
      if (filterData['table_config']['audit_date_time']?.value != null) {
        filterData['table_config']['audit_date_time'].value = new Date(filterData['table_config']['audit_date_time'].value);
      }
      // this.primengTable['_sortField'] = filterData['sortColumn'];
      // this.sortColumn = filterData['sortColumn'];
      this.primengTable['filters'] = filterData['table_config'];
      this._selectedColumns = filterData['selectedColumns'] || [];
      this.isFilterShow = true;
    }
  }

  get selectedColumns(): Column[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: Column[]) {
    if (Array.isArray(val)) {
      this._selectedColumns = this.cols.filter(col =>
        val.some(selectedCol => selectedCol.field === col.field)
      );
    } else {
      this._selectedColumns = [];
    }
  }

  getFilter(): any {

    let filterReq = {}
    // const filterReq = GridUtils.GetFilterReq(
    //   this._paginator,
    //   this._sort,
    //   this.searchInputControl.value
    // );
    // const filter = this.currentFilter;
    filterReq['status'] = this.currentFilter.status;
    filterReq['fromDate'] = "";
    filterReq['toDate'] = "";
    // filterReq['fromDate'] = DateTime.fromJSDate(this.currentFilter.fromDate).toFormat('yyyy-MM-dd');
    // filterReq['toDate'] = DateTime.fromJSDate(this.currentFilter.toDate).toFormat('yyyy-MM-dd')
    return filterReq;
  }

  filter(): void {
    this.matDialog.open(PaymentFilterComponent, {
      data: { data: this.currentFilter, name: 'Payment filter' },
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
      data: { payment: data.id }
    });
  }


  refreshItems(event?: any): void {
    this.isLoading = true;
    var newModel = this.getNewFilterReq(event);
    var extraModel = this.getFilter();
    var Model = { ...newModel, ...extraModel }
    this.accountService.getPaymentList(Model).subscribe({
      next: (data) => {
        this.dataList = data.data;
        this.totalRecords = data.total;
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
    // // only one show tab
    // // if(!data.show)
    // // this.dataList.forEach(x => x.show = false)

    // data.show = !data.show;
    // this.infoList = [data]

    // // Change the name of the button.
    // if(this.show)
    //   this.buttonName = "Hide";
    // else
    //   this.buttonName = "Show";
  }

  copyLink(link: string): void {
    this.clipboard.copy(link);
    this.alertService.showToast('success', 'Link Copied');
  }

  exportExcel(): void {
    if (!Security.hasExportDataPermission(this.module_name)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const filterReq = this.getNewFilterReq({});

    filterReq['status'] = this.currentFilter.status;
    filterReq['fromDate'] = DateTime.fromJSDate(this.currentFilter.fromDate).toFormat('yyyy-MM-dd');
    filterReq['toDate'] = DateTime.fromJSDate(this.currentFilter.toDate).toFormat('yyyy-MM-dd')
    filterReq['Take'] = this.totalRecords;

    this.accountService.getPaymentList(filterReq).subscribe(data => {
      for (var dt of data.data) {
        dt.payment_request_date = dt.payment_request_date ? DateTime.fromISO(dt.payment_request_date).toFormat('dd-MM-yyyy hh:mm a') : '';
        dt.audit_date_time = dt.audit_date_time ? DateTime.fromISO(dt.audit_date_time).toFormat('dd-MM-yyyy hh:mm a') : '';
        dt.payment_date = dt.payment_date ? DateTime.fromISO(dt.payment_date).toFormat('dd-MM-yyyy hh:mm a') : '';
        dt.payment_amount = dt.payment_amount + ' ' + dt.payment_currency
      }
      Excel.export(
        'Payment',
        [
          { header: 'Transaction ID', property: 'transaction_ref_no' },
          { header: 'Ref no.', property: 'payment_ref_no' },
          { header: 'Status', property: 'payment_status' },
          { header: 'To', property: 'payment_to' },
          { header: 'For', property: 'service_for' },
          { header: 'Amount', property: 'payment_amount' },
          { header: 'Mode Of Payment', property: 'mode_of_payment' },
          { header: 'Requested', property: 'payment_request_date' },
          { header: 'Audited', property: 'audit_date_time' },
          { property: 'payment_date', header: 'Payment Date' },
          { property: 'payment_reject_reason', header: 'Payment Reject Reason' },
          { property: 'payment_type', header: 'Payment Type' },
        ],
        data.data, "Payment", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }]);
    });
  }
  getNewFilters(arg0: {}) {
    throw new Error('Method not implemented.');
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  ngOnDestroy() {
    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }
}
