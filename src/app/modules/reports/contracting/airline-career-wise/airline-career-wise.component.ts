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
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { dateRange } from 'app/common/const';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { module_name, filter_module_name, Security, messages } from 'app/security';
import { AirlineSummaryService } from 'app/services/airline-summary.service';
import { CommonUtils } from 'app/utils/commonutils';
import { DateTime } from 'luxon';
import { Excel } from 'app/utils/export/excel';

@Component({
  selector: 'app-airline-career-wise',
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
  templateUrl: './airline-career-wise.component.html',
  styleUrls: ['./airline-career-wise.component.scss']
})
export class AirlineCareerWiseComponent extends BaseListingComponent implements OnDestroy {

  dataList = [];
  airlinesData: any[] = []; // API response data
  supplierColumns: any[] = []; // Array to hold supplier columns dynamically
  displayData: any[] = []; // Data for the table display (flattened for Carrier, Domestic, International rows)

  searchInputControl = new FormControl('');


  DR = dateRange;
  public startDate = new FormControl();
  public endDate = new FormControl();
  public StartDate: any;
  public EndDate: any;
  public dateRanges = [];
  public date = new FormControl();

  module_name = module_name.airline_career
  filter_table_name = filter_module_name.airline_summary;

  constructor(
    private confirmService: FuseConfirmationService,
    private router: Router,
    private airlineSummaryService: AirlineSummaryService,
    private matDialog: MatDialog,
    public _filterService: CommonFilterService
  ) {
    super(module_name.airline_career)
    this.key = 'supplier';
    this.sortColumn = 'supplier';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this.dateRanges = CommonUtils.valuesArray(dateRange);
    this.date.patchValue(dateRange.lastWeek);
    this.updateDate(dateRange.lastWeek, false)
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit(): void {
  }

  refreshItems(event?: any): void {
    this.isLoading = true;

    const request = {};
    request['From_Date'] = DateTime.fromJSDate(this.startDate.value).toFormat('yyyy-MM-dd');
    request['To_Date'] = DateTime.fromJSDate(this.endDate.value).toFormat('yyyy-MM-dd');
    request['Filter'] = this.searchInputControl.value

    this.airlineSummaryService.airlineCarrierSummary(request).subscribe({
      next: (data) => {
        this.isLoading = false;

        this.airlinesData = data.data;

        // If there's data, process it to create dynamic columns and rows
        if (this.airlinesData.length > 0) {
          const firstRow = this.airlinesData[0];

          // Extract supplier columns dynamically (fields ending with "_air")
          this.supplierColumns = Object.keys(firstRow)
            .filter(key => key.endsWith('_air') || key.endsWith('_air_2'))
            .map(key => ({
              field: key,    // Key name (e.g., 'tbo_air', 'jck_air')
              header: key  // Header display name (e.g., 'TBO', 'JCK')
            }));

          // Generate display data by flattening the rows (carrier, domestic, international)
          this.buildDisplayData();
        }

      }, error: (err) => {
        this.alertService.showToast('error', err)
        this.isLoading = false
      }
    });
  }

  // Helper to extract supplier values dynamically (for either total, domestic, or international)
  getSupplierValues(row: any, type: string = '') {
    const result = {};

    this.supplierColumns.forEach(col => {
      const fieldName = type ? `${col.field}_${type}` : col.field;
      result[col.field] = row[fieldName] || 0;
    });

    return result;
  }

  buildDisplayData() {
    this.displayData = [];

    this.airlinesData.forEach(row => {
      // Create three rows for each carrier: Carrier, Domestic, International
      this.displayData.push({
        type: 'Carrier',
        carrier: row.carrier,
        total: row.total,
        ...this.getSupplierValues(row)
      });

      this.displayData.push({
        type: 'Domestic',
        carrier: 'Domestic',
        total: row.domestic_Total,
        ...this.getSupplierValues(row, 'Domestic')
      });

      this.displayData.push({
        type: 'International',
        carrier: 'International',
        total: row.international_Total,
        ...this.getSupplierValues(row, 'International')
      });
    });
  }


  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }


  // Export the data to Excel
  exportExcel() {
    if (!Security.hasExportDataPermission(module_name.airline_career)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    // Define dynamic headers for Excel
    const headers = [
      { header: 'Carrier', property: 'carrier' },
      { header: 'Total', property: 'total' },
      ...this.supplierColumns.map(col => ({
        header: col.header,
        property: col.field
      }))
    ];

    // Pass the display data to the Excel export method
    Excel.export(
      'Airline Career Wise Analysis',
      headers,
      this.displayData,  // Data containing carrier, domestic, and international rows
      "Airline Career Wise Analysis",
      [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }]
    );
  }





  public updateDate(event: any, isRefresh: boolean = true): void {
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
    this.updateDate(dateRange.today);
  }

}
