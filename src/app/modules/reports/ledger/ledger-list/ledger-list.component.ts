import { cloneDeep } from 'lodash';
import { NgIf, NgFor, DatePipe, CommonModule, NgClass } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, filter_module_name, messages, module_name } from 'app/security';
import { LedgerService } from 'app/services/ledger.service';
import { Excel } from 'app/utils/export/excel';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { LedgerFilterComponent } from '../ledger-filter/ledger-filter.component';
import { PerticularInfoComponent } from '../perticular-info/perticular-info.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
  selector: 'app-ledger-list',
  templateUrl: './ledger-list.component.html',
  styles: [`
  .tbl-grid {
    grid-template-columns:  100px 240px 510px 100px 100px 100px 110px;
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
    PrimeNgImportsModule,
    MatTooltipModule
  ],
})
export class LedgerListComponent extends BaseListingComponent {
  // @ViewChild(MatPaginator) public _paginator: MatPaginator;

  module_name = module_name.ledger;
  filter_table_name = filter_module_name.account_ledger;
  private settingsUpdatedSubscription: Subscription;
  legerFilter: any;
  total: any;
  isFilterShow: boolean = false;
  public Filter: any;

  columns = [
    { key: 'datetime', name: 'Date', isShow: true, is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: false, class: '', is_sticky: false, indicator: false, },
    { key: 'reference_number', name: 'Reference Number', is_date: false, date_formate: '', is_sortable: false, class: '', is_sticky: false, indicator: true, tooltip: true },
    { key: 'particular', name: 'Particular', isview: true, is_date: false, date_formate: '', is_sortable: false, class: '', is_sticky: false, indicator: true, tooltip: true },
    // { key: 'remark', name: 'Remark',isRemark:false, is_date: false, date_formate: '', is_sortable: false, class: '', is_sticky: false, indicator: true, tooltip: true },
    { key: 'debit', name: 'Debit', isFix: true, is_date: false, date_formate: '', is_sortable: false, class: 'header-right-view', is_sticky: true, indicator: false, row_class: 'text-red-500' },
    { key: 'credit', name: 'Credit', isFix: true, is_date: false, date_formate: '', is_sortable: false, class: 'header-right-view', is_sticky: true, indicator: false, row_class: 'text-green-500' },
    { key: 'balance', name: 'Balance', isFix: true, is_date: false, date_formate: '', is_sortable: false, class: 'header-right-view', is_sticky: true, indicator: false },
    // { key: ' ', name: 'Total Balance', isFix: false, is_date: false, date_formate: '', is_sortable: false, class: 'header-right-view', is_sticky: true, indicator: false, totalblc: true },
  ]
  cols = [];
  dataList: any[] = [];
  tempData: any[] = [];
  Alldata: any[] = [];
  balance: any


  searchInternalFilter = new FormControl('');
  agentName: any;

  constructor(
    private matDialog: MatDialog,
    private ledgerService: LedgerService,
    public _filterService: CommonFilterService
  ) {
    super(module_name.ledger)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'datetime';
    this.sortDirection = 'asc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);

    this.legerFilter = {
      agent_for: '',
      currencyId: '',
      agent_id: '',
      date: '',
      service_for: '',
      // startDate: new Date(),
      // endDate: new Date(),
      fromDate: new Date(),
      toDate: new Date(),
    }

  }

  ngOnInit(): void {
    this.filter();

    this.searchInternalFilter.valueChanges.subscribe(text => {
      const filterdData = this.Alldata.filter(x =>
        x.reference_number?.toLowerCase().includes(text.toLowerCase())
        || x.particular?.toLowerCase().includes(text.toLowerCase())
        || x.credit?.toString().toLowerCase().includes(text.toLowerCase())
        || x.debit?.toString().toLowerCase().includes(text.toLowerCase())
        || x.balance?.toString().toLowerCase().includes(text.toLowerCase())
      );
      // this.paginator.pageIndex = 0;
      // this.setPaginator(filterdData);
    });

    // common filter
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      this.sortColumn = resp['sortColumn'];
      this.primengTable['_sortField'] = resp['sortColumn'];
      if (resp['table_config']['datetime'].value) {
        resp['table_config']['datetime'].value = new Date(resp['table_config']['datetime'].value);
      }
      this.primengTable['filters'] = resp['table_config'];
      this.isFilterShow = true;
      this.primengTable._filter();
    });

  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      this.isFilterShow = true;
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      if (filterData['table_config']['datetime'].value) {
        filterData['table_config']['datetime'].value = new Date(filterData['table_config']['datetime'].value);
      }
      this.primengTable['_sortField'] = filterData['sortColumn'];
      this.sortColumn = filterData['sortColumn'];
      this.primengTable['filters'] = filterData['table_config'];
    }
  }

  totalCount(dataList) {
    const cradit = (dataList.balance) - (dataList.credit)
    const debit = (dataList.balance) - (dataList.debit)
  }

  filter(): void {
    this.matDialog.open(LedgerFilterComponent, {
      data: this.legerFilter,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.legerFilter = res;
        this.agentName = this.legerFilter.agent_id.agency_name
        this.refreshItems();
      }
    })
  }

  view(record: any) {
    this.matDialog.open(PerticularInfoComponent, {
      data: record,
      disableClose: true
    }).afterClosed().subscribe()
  }


  getFilter(): any {
    const filterReq = {};
    // filterReq["fromDate"] = this.legerFilter?.fromDate;
    // filterReq["toDate"] = this.legerFilter?.toDate;
    filterReq['fromDate'] = DateTime.fromJSDate(this.legerFilter.fromDate).toFormat('yyyy-MM-dd');
    filterReq['toDate'] = DateTime.fromJSDate(this.legerFilter.toDate).toFormat('yyyy-MM-dd');
    filterReq["agent_for"] = this.legerFilter?.agent_for;
    filterReq["service_for"] = this.legerFilter?.service_for;
    filterReq["agent_id"] = this.legerFilter?.agent_id?.id || "";
    filterReq["currencyId"] = this.legerFilter?.currencyId?.id || "";
    filterReq['columeFilters'] = {};
    return filterReq;
  }


  refreshItems(event?: any): void {
    this.isLoading = true;
    let newModel = this.getNewFilterReq(event)
    let extraModel = this.getFilter();
    let model = { ...newModel, ...extraModel }
    this.ledgerService.getLedger(model).subscribe({
      next: (res) => {
        this.isLoading = false;
        // res.data[res.data.length - 1].balance = '';

        this.dataList = res.data;

        for (let i = 0; i < this.dataList.length; i++) {

          const balance = this.dataList[i].balance;
          const credit = this.dataList[i].credit;
          const debit = this.dataList[i].debit;

          const countCredit = balance + credit;
          const countDebit = balance - debit;

          // parseFloat(countCredit). toFixed(2);
          this.dataList[i].countCredit = parseFloat(countCredit).toFixed(2);
          this.dataList[i].countDebit = countDebit.toFixed(2);
          this.dataList[i].datetime = new Date(this.dataList[i].datetime);
        }

        this.Alldata = res.data;
        this.totalRecords = res.data.length;

        // this.setPaginator();

      }, error: err => {
        this.alertService.showToast('error', err);
        this.isLoading = false;
      },
    });
  }

  parseBookingInfo(info: string) {
    const pnrMatch = info.match(/PNR:([\w/]+)/);
    const bookingRefMatch = info.match(/Booking Ref:([\w]+)/);
    const paymentRefMatch = info.match(/Payment Ref:([\w]+)/);

    const pnr = pnrMatch ? pnrMatch[1] : '';
    const bookingRef = bookingRefMatch ? bookingRefMatch[1] : '';
    const paymentRef = paymentRefMatch ? paymentRefMatch[1] : '';

    // Get the main description (everything before PNR, Booking Ref, or Payment Ref, whichever comes first)
    const mainDescription = info.split(/(PNR:|Booking Ref:|Payment Ref:)/)[0].trim();

    return { mainDescription, pnr, bookingRef, paymentRef };

  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInternalFilter.value)
      return `no search results found for \'${this.searchInternalFilter.value}\'.`;
    else return 'No data to display';
  }

  // setPaginator(filterdData?): void {
  //   const index = this._paginator?.pageIndex || 0;
  //   const size = this._paginator?.pageSize;
  //   let data = filterdData ? filterdData : this.Alldata;
  //   this.dataList = data.slice(index * size, (index * size) + size);
  // }

  exportExcel(): void {
    if (!Security.hasExportDataPermission('Ledger')) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    // this.ledgerService.getLedger(this.getFilter()).subscribe(data => {
    this.tempData = cloneDeep(this.dataList)
    for (var dt of this.tempData) {
      // dt.datetime = DateTime.fromISO(dt.datetime).toFormat('dd-MM-yyyy hh:mm a')
      dt.datetime = new DatePipe('en-US').transform(dt.datetime, 'dd-MM-yyyy HH:mm');

    }
    Excel.export(
      'Ledger',
      [
        { header: 'Date', property: 'datetime' },
        { header: 'Reference Number', property: 'reference_number' },
        { header: 'Particular', property: 'particular' },
        { header: 'Remark', property: 'remark' },
        { header: 'Credit', property: 'credit' },
        { header: 'Debit', property: 'debit' },
        { header: 'Balance', property: 'balance' },
      ],
      this.tempData, "Ledger", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }]);
    // });
  }

  ngOnDestroy(): void {
    // this.masterService.setData(this.key, this);

    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }
}

