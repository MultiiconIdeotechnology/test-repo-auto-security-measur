import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PgRefundService } from 'app/services/pg-refund.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { module_name, filter_module_name, Security, messages } from 'app/security';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { BehaviorSubject, Subscription } from 'rxjs';
import { dateRangeContracting } from 'app/common/const';
import { CommonUtils } from 'app/utils/commonutils';

@Component({
  selector: 'app-pg-refund-list',
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
  templateUrl: './pg-refund-list.component.html',
  styleUrls: ['./pg-refund-list.component.scss'],
})
export class PgRefundListComponent extends BaseListingComponent implements OnDestroy {
  selectedRefundDateSubject = new BehaviorSubject<any>('');
  selectionRefundOption$ = this.selectedRefundDateSubject.asObservable();
  DR = dateRangeContracting;
  public startDate = new FormControl();
  public endDate = new FormControl();
  public StartDate: any;
  public EndDate: any;
  public dateRangeContractings = [];
  public date = new FormControl();

  module_name = module_name.pgRefund;
  filter_table_name = filter_module_name.pg_refund;
  private settingsUpdatedSubscription: Subscription;
  dataList = [];
  total = 0;
  isFilterShow: boolean = false;
  agentList: any[] = [];
  selectedAgent: any;
  selectedRM: any;

  // serviceList = ['Airline', 'Hotel', 'Bus', 'Visa'];
  serviceList = [
    { label: 'Airline', value: 'Airline' },
    { label: 'Hotel', value: 'Hotel' },
    { label: 'Bus', value: 'Bus' },
    { label: 'Visa', value: 'Visa' },
  ];

  // typeList = ['Rejected', 'Booking Failed', 'Cancelled', 'Partially Cancelled'];
  typeList = [
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Booking Failed', value: 'Booking Failed' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Partially Cancelled', value: 'Partially Cancelled' },
  ];

  constructor(
    private pgRefundService: PgRefundService,
    public _filterService: CommonFilterService
  ) {
    super(module_name.pgRefund)
    this.key = 'requestDate';
    this.sortColumn = 'requestDate';
    this.sortDirection = 'desc';
    this.Mainmodule = this;

    this.dateRangeContractings = CommonUtils.valuesArray(dateRangeContracting);
    this.date.patchValue(dateRangeContracting.lastMonth);
    this.updateDate(dateRangeContracting.lastMonth, false)

    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit(): void {
    this.agentList = this._filterService.agentListByValue;

    // common filter
    this._filterService.updateSelectedOption('');
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
      this._filterService.updateSelectedOption('');
      this.selectedAgent = resp['table_config']['agency_name']?.value;
      if (this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }

      this.selectedRM = resp['table_config']['employee_name']?.value;
      // this.sortColumn = resp['sortColumn'];
      // this.primengTable['_sortField'] = resp['sortColumn'];
      if (resp['table_config']['due_date']?.value != null && resp['table_config']['due_date'].value.length) {
        this._filterService.updateSelectedOption('custom_date_range');
        this._filterService.rangeDateConvert(resp['table_config']['due_date']);
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
      this.selectedAgent = filterData['table_config']['agency_name']?.value;
      this.selectedRM = filterData['table_config']['employee_name']?.value;
      if (this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }
      if (filterData['table_config']['due_date']?.value != null && filterData['table_config']['due_date'].value.length) {
        this._filterService.updateSelectedOption('custom_date_range');
        this._filterService.rangeDateConvert(filterData['table_config']['due_date']);
      }
      // this.primengTable['_sortField'] = filterData['sortColumn'];
      // this.sortColumn = filterData['sortColumn'];
      this.primengTable['filters'] = filterData['table_config'];
    }
  }

  refreshItems(event?: any): void {
    this.isLoading = true;

    const request = this.getNewFilterReq(event);
    request['refund_from_date'] = DateTime.fromJSDate(this.startDate.value).toFormat('yyyy-MM-dd');
    request['refund_to_date'] = DateTime.fromJSDate(this.endDate.value).toFormat('yyyy-MM-dd');

    this.pgRefundService.getPGRefundReport(request).subscribe({
      next: (data) => {
        this.dataList = data.data;
        // this.total = data.total;
        this.totalRecords = data.total;
        this.isLoading = false;
      }, error: (err) => {
        this.alertService.showToast('error', err)
        this.isLoading = false
      }
    });
  }


  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  exportExcel(event): void {
    if (!Security.hasExportDataPermission(module_name.pgRefund)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    let newModel = this.getNewFilterReq({})
    newModel['Take'] = this.totalRecords;
    newModel['refund_from_date'] = DateTime.fromJSDate(this.startDate.value).toFormat('yyyy-MM-dd');
    newModel['refund_to_date'] = DateTime.fromJSDate(this.endDate.value).toFormat('yyyy-MM-dd');
    this.pgRefundService.getPGRefundReport(newModel).subscribe(data => {
      for (var dt of data.data) {
        dt.requestDate = dt.requestDate ? DateTime.fromISO(dt.requestDate).toFormat('dd-MM-yyyy hh:mm a') : '';
        dt.refundDate = dt.refundDate ? DateTime.fromISO(dt.refundDate).toFormat('dd-MM-yyyy hh:mm a') : '';
      }
      Excel.export(
        'PG Refund',
        [
          { header: 'Ref. No.', property: 'refNo' },
          { header: 'Service', property: 'service' },
          { header: 'PSP Name', property: 'pspName' },
          { header: 'PSP Ref. No.', property: 'pspRefNo' },
          { header: 'Type', property: 'type' },
          { header: 'Amount', property: 'amount' },
          { header: 'Request Date', property: 'requestDate' },
          { header: 'Refund Date', property: 'refundDate' },
          { header: 'Refunded Amount', property: 'refundedAmount' },
          { header: 'Payment Method', property: 'paymentMethod' },
        ],
        data.data, "PG Refund", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }]);
    });
  }

  ngOnDestroy(): void {

    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }

  public updateDate(event: any, isRefresh: boolean = true): void {
    if (event === dateRangeContracting.today) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      this.StartDate.setDate(this.StartDate.getDate());
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
    else if (event === dateRangeContracting.lastWeek) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      const dt = new Date(); // current date of week
      const currentWeekDay = dt.getDay();
      const lessDays = currentWeekDay === 0 ? 6 : currentWeekDay - 1;
      const wkStart = new Date(new Date(dt).setDate(dt.getDate() - lessDays));
      const wkEnd = new Date(new Date(wkStart).setDate(wkStart.getDate() + 6));

      this.StartDate = wkStart;
      this.EndDate = new Date();
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
    else if (event === dateRangeContracting.previousMonth) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      this.StartDate.setDate(1);
      this.StartDate.setMonth(this.StartDate.getMonth() - 1);
      this.startDate.patchValue(this.StartDate);
      this.EndDate.setDate(1)
      this.EndDate.setDate(this.EndDate.getDate() - 1)
      this.endDate.patchValue(this.EndDate);

    }
    else if (event === dateRangeContracting.lastMonth) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      this.StartDate.setDate(1);
      this.StartDate.setMonth(this.StartDate.getMonth());
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
    else if (event === dateRangeContracting.last3Month) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      this.StartDate.setDate(1);
      this.StartDate.setMonth(this.StartDate.getMonth() - 3);
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
    else if (event === dateRangeContracting.last6Month) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      this.StartDate.setDate(1);
      this.StartDate.setMonth(this.StartDate.getMonth() - 6);
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
    else if (event === dateRangeContracting.setCustomDate) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
    if (isRefresh)
      this.refreshItems();
  }

  dateRangeChange(start, end): void {
    if (start.value && end.value) {
      this.StartDate = start.value;
      this.EndDate = end.value;
      this.refreshItems();
    }
  }

  cancleDate() {
    this.date.patchValue('Today');
    this.updateDate(dateRangeContracting.today);
  }

  onContractionOption(option: any, primengTable: any, field: any, key?: any) {
    // this.selectionDateDropdown = option.id_by_value;
    this.selectedRefundDateSubject.next(option.id_by_value);
   
    if(option.id_by_value && option.id_by_value != 'custom_date_range'){
        primengTable.filter(option, field, 'custom');
    } 
}

}


