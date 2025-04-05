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
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { filter_module_name, messages, module_name, Security } from 'app/security';
import { AirlineSummaryService } from 'app/services/airline-summary.service';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';
import { Excel } from 'app/utils/export/excel';
import { IndianNumberPipe } from '@fuse/pipes/indianNumberFormat.pipe';

@Component({
  selector: 'app-airline-monthly',
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
    PrimeNgImportsModule,
    IndianNumberPipe
  ],
  templateUrl: './airline-monthly.component.html',
  styleUrls: ['./airline-monthly.component.scss']
})
export class AirlineMonthlyComponent extends BaseListingComponent implements OnDestroy {

  latestMonths: number[] = [];
  dataList = []
  module_name = module_name.airline_monthly
  filter_table_name = filter_module_name.airline_monthly;

  private settingsUpdatedSubscription: Subscription;
  isFilterShow: boolean = false;

//   monthsBack: number = 0;
  totalRecords: number = 0;
  isLoading: boolean = false;

  currentMonthIndex: number;
  availableMonths: { name: string, value: number }[] = [];
  selectedMonth: number = 1;

  monthDataList = [2,3,4,5,6,]
  public monthsBack = new FormControl(this.monthDataList[0]);

  hideDomVolume: boolean = false;

  constructor(
    private confirmService: FuseConfirmationService,
    private router: Router,
    private airlineSummaryService: AirlineSummaryService,
    private matDialog: MatDialog,
    public _filterService: CommonFilterService
  ) {
    super(module_name.airline_monthly)
    this.key = 'supplier';
    this.sortColumn = 'supplier';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit() {
    const currentDate = DateTime.now();
    this.currentMonthIndex = currentDate.month; // Current month index

    // Set up the months array
    this.setupMonths();

    this.selectedMonth = 1; // Default to September
    // this.monthsBack = 1; // Set monthsBack to September

    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      this.primengTable['filters'] = resp['table_config'];
      this.isFilterShow = true;
      this.primengTable._filter();
    });
  }


  refreshItems(event?: any): void {
    this.isLoading = true;

    const request = this.getNewFilterReq(event);
    request['monthsBack'] = this.monthsBack.value;

    this.airlineSummaryService.airlineMonthlyAnalysis(request).subscribe({
      next: (data) => {
        this.processData(data.data);
        this.totalRecords = this.dataList.length;
        this.isLoading = false;
      },
      error: (err) => {
        this.alertService.showToast('error', err);
        this.isLoading = false;
      }
    });
  }

  // processData(data: any[]) {
  //   // Extract distinct suppliers
  //   const groupedData = data.reduce((acc, item) => {
  //     if (!acc[item.supplier]) {
  //       acc[item.supplier] = {
  //         supplier: item.supplier,
  //         avg_Volume: item.avg_Volume,
  //         avg_Volume_Domestic: item.avg_Volume_Domestic,
  //         avg_Volume_International: item.avg_Volume_International,
  //         avg_Growth: item.avg_Growth,
  //         avg_Growth_Domestic: item.avg_Growth_Domestic,
  //         avg_Growth_International: item.avg_Growth_International,
  //         monthData: []
  //       };
  //     }
  //     acc[item.supplier].monthData.push(item);
  //     return acc;
  //   }, {});

  //   // Convert the grouped data into an array
  //   this.dataList = Object.values(groupedData);

  //   // Extract the latest 3 months based on data provided
  //   this.latestMonths = [...new Set(data.map(item => item.month))].sort((a, b) => b - a).slice(0, this.monthsBack.value);
  // }

  processData(data: any[]) {
    // Extract distinct suppliers
    const groupedData = data.reduce((acc, item) => {
        if (!acc[item.supplier]) {
            acc[item.supplier] = {
                supplier: item.supplier,
                avg_Volume: item.avg_Volume,
                avg_Volume_Domestic: item.avg_Volume_Domestic,
                avg_Volume_International: item.avg_Volume_International,
                avg_Growth: item.avg_Growth,
                avg_Growth_Domestic: item.avg_Growth_Domestic,
                avg_Growth_International: item.avg_Growth_International,
                monthData: []
            };
        }
        acc[item.supplier].monthData.push(item);
        return acc;
    }, {});

    // Convert the grouped data into an array
    this.dataList = Object.values(groupedData);

    // Sort months by Year + Month to correctly order them
    this.latestMonths = [...new Set(data.map(item => `${item.year}-${item.month}`))]
        .sort((a, b) => {
            const [yearA, monthA] = a.split('-').map(Number);
            const [yearB, monthB] = b.split('-').map(Number);
            return yearB - yearA || monthB - monthA; // Sort by Year, then by Month
        })
        .slice(0, this.monthsBack.value) // Keep the latest N months
        .map(entry => Number(entry.split('-')[1])); // Extract only the month numbers for display
}


  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }



  monthsName(no: any) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[no - 1]
  }

  setupMonths() {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Create available months based on current month
    for (let i = 1; i < this.currentMonthIndex; i++) {
      this.availableMonths.push({ name: monthNames[i - 1], value: this.currentMonthIndex - i });
    }

  }

  onMonthSelectionChange(event: any) {
    this.monthsBack = event.value
    this.refreshItems();
  }

  exportExcel(): void {
    if (!Security.hasExportDataPermission(module_name.airline_monthly)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    const latestMonthNames = this.latestMonths.map(month => this.monthsName(month)); // Dynamic month names

    const formattedData = this.dataList.map(supplier => {
      const monthData = supplier.monthData.reduce((acc, item, index) => {
        acc[`month${index + 1}_Volume`] = item.volume;
        acc[`month${index + 1}_Growth`] = item.growth + '%';
        acc[`month${index + 1}_Volume_Dom`] = item.volume_Domestic;
        acc[`month${index + 1}_Growth_Dom`] = item.growth_Domestic + '%';
        acc[`month${index + 1}_Volume_Int`] = item.volume_International;
        acc[`month${index + 1}_Growth_Int`] = item.growth_International + '%';
        return acc;
      }, {
        supplier: supplier.supplier,
        avg_Volume: supplier.avg_Volume,
        avg_Dom_Volume: supplier.avg_Volume_Domestic,
        avg_Int_Volume: supplier.avg_Volume_International,
        avg_Growth: supplier.avg_Growth + '%',
        avg_Dom_Growth: supplier.avg_Growth_Domestic + '%',
        avg_Int_Growth: supplier.avg_Growth_International + '%'
      });
      return monthData;
    });

    const columns = [
      { header: 'Supplier', property: 'supplier' },
      { header: 'Avg Volume (INR)', property: 'avg_Volume' },
      { header: 'Avg Dom. Volume (INR)', property: 'avg_Dom_Volume' },
      { header: 'Avg Int. Volume (INR)', property: 'avg_Int_Volume' },
      { header: 'Avg Growth (%)', property: 'avg_Growth' },
      { header: 'Avg Growth Dom. (%)', property: 'avg_Dom_Growth' },
      { header: 'Avg Growth Int. (%)', property: 'avg_Int_Growth' },
      ...latestMonthNames.map((name, index) => ([
        { header: `${name} Volume (INR)`, property: `month${index + 1}_Volume` },
        { header: `${name} Growth (%)`, property: `month${index + 1}_Growth` },
        { header: `${name} Volume Dom (INR)`, property: `month${index + 1}_Volume_Dom` },
        { header: `${name} Growth Dom. (%)`, property: `month${index + 1}_Growth_Dom` },
        { header: `${name} Volume Int. (INR)`, property: `month${index + 1}_Volume_Int` },
        { header: `${name} Growth Int. (%)`, property: `month${index + 1}_Growth_Int` }
      ])).flat() // Flatten the array of arrays into a single array
    ];

    Excel.export(
      'Airline Monthly Analysis',
      columns,
      formattedData,
      'Airline Monthly Analysis'
    );
  }

}
