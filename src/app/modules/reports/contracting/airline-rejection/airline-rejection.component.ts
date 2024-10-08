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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterOutlet } from '@angular/router';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { dateRange } from 'app/common/const';
import { module_name, filter_module_name, Security, messages } from 'app/security';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { AirlineSummaryService } from 'app/services/airline-summary.service';
import { CommonUtils } from 'app/utils/commonutils';
import { DateTime } from 'luxon';
import { SupplierInfoComponent } from './supplier-info/supplier-info.component';
import { Excel } from 'app/utils/export/excel';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-airline-rejection',
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
  templateUrl: './airline-rejection.component.html',
  styleUrls: ['./airline-rejection.component.scss']
})
export class AirlineRejectionComponent extends BaseListingComponent implements OnDestroy{

  dataList = [];

  private settingsUpdatedSubscription: Subscription;
  isFilterShow: boolean = false;

  DR = dateRange;
  public startDate = new FormControl();
  public endDate = new FormControl();
  public StartDate: any;
  public EndDate: any;
  public dateRanges = [];
  public date = new FormControl();

  module_name = module_name.airline_rejection
  filter_table_name = filter_module_name.airline_rejection

  constructor(
    private confirmService: FuseConfirmationService,
    private router: Router,
    private airlineSummaryService: AirlineSummaryService,
    private matDialog: MatDialog,
    public _filterService: CommonFilterService
  ) {
    super(module_name.airline_rejection)
    this.key = 'supplier';
    this.sortColumn = 'supplier';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this.dateRanges = CommonUtils.valuesArray(dateRange);
    this.date.patchValue(dateRange.lastWeek);
    this.updateDate(dateRange.lastWeek,false)
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit(): void {
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      // this.sortColumn = resp['sortColumn'];
      // this.primengTable['_sortField'] = resp['sortColumn'];
      this.primengTable['filters'] = resp['table_config'];
      this.isFilterShow = true;
      this.primengTable._filter();
    });
  }

  refreshItems(event?:any): void {
    this.isLoading = true;

    const request = this.getNewFilterReq(event);
    request['From_Date'] = DateTime.fromJSDate(this.startDate.value).toFormat('yyyy-MM-dd');
    request['To_Date'] = DateTime.fromJSDate(this.endDate.value).toFormat('yyyy-MM-dd');

    this.airlineSummaryService.airlineRejectionSupplierWiseAnalysis(request).subscribe({
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

  supplierInfo(data){
    console.log("data",data);

    this.matDialog.open(SupplierInfoComponent,
      { data: {
        supplier: data,
        From_Date: DateTime.fromJSDate(this.startDate.value).toFormat('yyyy-MM-dd'),
        To_Date: DateTime.fromJSDate(this.endDate.value).toFormat('yyyy-MM-dd'),
      }, disableClose: true, })
      .afterClosed()
      .subscribe((res) => {
          
      });
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }


  exportExcel(): void {
    if (!Security.hasExportDataPermission(module_name.airline_rejection)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    const filterReq = this.getNewFilterReq({});
    filterReq['From_Date'] = DateTime.fromJSDate(this.startDate.value).toFormat('yyyy-MM-dd');
    filterReq['To_Date'] = DateTime.fromJSDate(this.endDate.value).toFormat('yyyy-MM-dd');
    filterReq['Take'] = this.totalRecords;

    this.airlineSummaryService.airlineRejectionSupplierWiseAnalysis(filterReq).subscribe(data => {
      const formattedData = data.data.map(dt => ({
        supplier: dt.supplier,
        totalConfirmed: dt.confirmed_Percentage,
        totalFailed: dt.failed_Percentage,
        domesticConfirmed: dt.confirmed_Percentage_Domestic,
        domesticFailed: dt.failed_Percentage_Domestic,
        internationalConfirmed: dt.confirmed_Percentage_International,
        internationalfailed: dt.failed_Percentage_International,
      }));

      // Define the columns for the Excel export
      const columns = [
        { header: 'Supplier', property: 'supplier' },
        { header: 'Total Confirmed', property: 'totalConfirmed' },
        { header: 'Total Faield', property: 'totalFailed' },
        { header: 'Domestic Confirmed', property: 'domesticConfirmed' },
        { header: 'Domestic Faield', property: 'domesticFailed' },
        { header: 'International Confirmed', property: 'internationalConfirmed' },
        { header: 'International Faield', property: 'internationalfailed' },
      ];

      // Export the data using the custom Excel utility
      Excel.export(
        'Airline Rejection Analysis',  // File name
        columns,            // Columns definition
        formattedData,      // Data rows
        'Airline Rejection Analysis',  // Sheet name
        [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }] // Optional merge (if required)
      );
    });
  }

  public updateDate(event: any, isRefresh:boolean = true): void {
    if (event === dateRange.today) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      this.StartDate.setDate(this.StartDate.getDate());
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
    else if (event === dateRange.last3Days) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      this.StartDate.setDate(this.StartDate.getDate() - 3);
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
    else if (event === dateRange.lastWeek) {
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
    else if (event === dateRange.lastMonth) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      this.StartDate.setDate(1);
      this.StartDate.setMonth(this.StartDate.getMonth());
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
    else if (event === dateRange.last3Month) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      this.StartDate.setDate(1);
      this.StartDate.setMonth(this.StartDate.getMonth() - 3);
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
    else if (event === dateRange.last6Month) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      this.StartDate.setDate(1);
      this.StartDate.setMonth(this.StartDate.getMonth() - 6);
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
    else if (event === dateRange.setCustomDate) {
      this.StartDate = new Date();
      this.EndDate = new Date();
      this.startDate.patchValue(this.StartDate);
      this.endDate.patchValue(this.EndDate);
    }
    if(isRefresh)
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
    this.updateDate(dateRange.today);
  }

}
