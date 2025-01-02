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
import { RouterOutlet } from '@angular/router';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { filter_module_name, messages, module_name, Security } from 'app/security';
import { DateTime } from 'luxon';
import { dateRangeContracting } from 'app/common/const';
import { CommonUtils } from 'app/utils/commonutils';
import { Excel } from 'app/utils/export/excel';
import { Subscription } from 'rxjs';
import { TechBusinessService } from 'app/services/tech-business.service';

@Component({
  selector: 'app-tech-business-summary',
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
  templateUrl: './tech-business-summary.component.html',
  styleUrls: ['./tech-business-summary.component.scss']
})

export class TechBusinessSummaryComponent extends BaseListingComponent implements OnDestroy {

  dataList = [];
  dataListTotals = [];

  DR = dateRangeContracting;
  public startDate = new FormControl();
  public endDate = new FormControl();
  public StartDate: any;
  public EndDate: any;
  public dateRangeContractings = [];
  public date = new FormControl();

  module_name = module_name.tech_business_summary
  filter_table_name = filter_module_name.tech_business_summary;

  private settingsUpdatedSubscription: Subscription;
  isFilterShow: boolean = false;

  constructor(
    private techService: TechBusinessService,
    public _filterService: CommonFilterService
  ) {
    super(module_name.tech_business_summary)
    // this.key = 'supplier';
    this.sortColumn = 'rm';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this.dateRangeContractings = CommonUtils.valuesArray(dateRangeContracting);
    this.date.patchValue(dateRangeContracting.lastWeek);
    this.updateDate(dateRangeContracting.lastWeek, false)
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit(): void {
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      this.primengTable['filters'] = resp['table_config'];
      this.isFilterShow = true;
      this.primengTable._filter();
    });
  }

  refreshItems(event?: any): void {
    this.isLoading = true;

    const request = this.getNewFilterReq(event);
    request['From_Date'] = DateTime.fromJSDate(this.startDate.value).toFormat('yyyy-MM-dd');
    request['To_Date'] = DateTime.fromJSDate(this.endDate.value).toFormat('yyyy-MM-dd');

    this.techService.getTechSummary(request).subscribe({
      next: (data) => {
        this.dataListTotals = data;
        this.dataList = data.data;
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

  exportExcel(): void {
    // if (!Security.hasExportDataPermission(module_name.tech_business_summary)) {
    //   return this.alertService.showToast('error', messages.permissionDenied);
    // }
    const filterReq = this.getNewFilterReq({});
    filterReq['From_Date'] = DateTime.fromJSDate(this.startDate.value).toFormat('yyyy-MM-dd');
    filterReq['To_Date'] = DateTime.fromJSDate(this.endDate.value).toFormat('yyyy-MM-dd');
    filterReq['Take'] = this.totalRecords;

    this.techService.getTechSummary(filterReq).subscribe(data => {
      const formattedData = data.data;

      // Define the columns for the Excel export
      const columns = [
        { header: 'RM', property: 'rm_name' },
        { header: 'New', property: 'new_partner' },
        { header: '1st Transaction', property: 'first_transaction_partner' },
        { header: 'Activated', property: 'activated' },
        { header: 'Total Business', property: 'total_business' },
        { header: 'Total New', property: 'total_new' },
        { header: 'Total Old', property: 'total_old' },
      ];

      // Create a shortened, dynamic sheet name
      const fromDate = DateTime.fromJSDate(this.startDate.value).toFormat('dd-MM-yyyy');
      const toDate = DateTime.fromJSDate(this.endDate.value).toFormat('dd-MM-yyyy');
      const sheetName = `Tech Business Summary ${fromDate} to ${toDate}`.substring(0, 45);
      
      // Export the data using the custom Excel utility
      Excel.export(
        'Tech Business Summary',  // File name
        columns,            // Columns definition
        formattedData,      // Data rows
        sheetName,          // Sheet name (limited to 31 characters)
        [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }], // Optional merge (if required)
        false
      );
    });
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

  dateRangeContractingChange(start, end): void {
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

  ngOnDestroy(): void {
    this.settingsUpdatedSubscription.unsubscribe()
  }

}



