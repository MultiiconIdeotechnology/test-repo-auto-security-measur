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
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { filter_module_name, messages, module_name, Security } from 'app/security';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';
import { Excel } from 'app/utils/export/excel';
import { TechBusinessService } from 'app/services/tech-business.service';
import { MatDialog } from '@angular/material/dialog';
import { OnboardSubreportComponent } from './onboard-subreport/onboard-subreport.component';
import { SalesSubreportComponent } from './sales-subreport/sales-subreport.component';


@Component({
  selector: 'app-rm-monthly-analytics',
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
  templateUrl: './rm-monthly-analytics.component.html',
  styleUrls: ['./rm-monthly-analytics.component.scss']
})

export class RmMonthlyAnalyticsComponent extends BaseListingComponent implements OnDestroy {

  latestMonths: number[] = [];
  dataList = []
  AlldataList = []
  module_name = module_name.tech_rm_monthly_report
  // filter_table_name = filter_module_name.tech_rm_monthly_report;

  // private settingsUpdatedSubscription: Subscription;
  isFilterShow: boolean = false;

  //   monthsBack: number = 0;
  totalRecords: number = 0;
  isLoading: boolean = false;

  currentMonthIndex: number;
  availableMonths: { name: string, value: number }[] = [];
  selectedMonth: number = 1;

  monthDataList = [2, 3, 4, 5, 6,]
  public monthsBack = new FormControl(this.monthDataList[0]);

  hideDomVolume: boolean = false;

  constructor(
    private techService: TechBusinessService,
    public _filterService: CommonFilterService,
    private matDialog: MatDialog,
  ) {
    super(module_name.tech_rm_monthly_report)
    this.key = 'rm';
    this.sortColumn = 'rm';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    // this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit() {
    const currentDate = DateTime.now();
    this.currentMonthIndex = currentDate.month; // Current month index

    // Set up the months array
    this.setupMonths();

    this.selectedMonth = 1; // Default to September
    // this.monthsBack = 1; // Set monthsBack to September

    // this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
    //   this.primengTable['filters'] = resp['table_config'];
    //   this.isFilterShow = true;
    //   this.primengTable._filter();
    // });
  }

  // monthsNameCol(month: string): string {
  //   console.log(month);
  //   console.log(new Date(month).toLocaleString('en-US', { month: 'long', year: 'numeric' }));
  //   return new Date(month).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  // }



  refreshItems(event?: any): void {
    this.isLoading = true;

    const request = this.getNewFilterReq(event);
    request['monthsBack'] = this.monthsBack.value;
    delete request['Take'];
    delete request['Skip'];

    this.techService.getRmMonthlyAnalytics(request).subscribe({
      next: (data) => {
        this.processData(data.data);
        this.AlldataList = data.column_total;
        this.totalRecords = this.dataList.length;
        this.isLoading = false;
      },
      error: (err) => {
        this.alertService.showToast('error', err);
        this.isLoading = false;
      }
    });
  }

  processData(data: any[]) {
    // Extract distinct suppliers
    const groupedData = data.reduce((acc, item) => {
      if (!acc[item.rm]) {
        acc[item.rm] = {
          rm: item.rm,
          avg_Onboard: item.avg_Onboard,
          avg_Activation: item.avg_Activation,
          avg_Sales: item.avg_Sales,
          monthData: []
        };
      }
      acc[item.rm].monthData.push(item);
      return acc;
    }, {});

    // Convert the grouped data into an array
    this.dataList = Object.values(groupedData);

    // Extract the latest 3 months based on data provided
    // this.latestMonths = [...new Set(data.map(item => item.month))].sort((a, b) => b - a).slice(0, this.monthsBack.value);
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


  // open a subreport for onboard
  openOnboardModal(key:string, monthData:any){
    let date = this.getFirstDateOfMonth(monthData.month, monthData.year)
    this.matDialog.open(OnboardSubreportComponent, {
                data: {
                  rm_id:monthData.rm_id,
                  rm_name: monthData.rm,
                  date:date,
                  type:key
                },
                panelClass: 'custom-dialog-modal',
            }).afterClosed().subscribe(res => {
                if (res) {
                    // this.refreshItems();
                }
            })
  }

  //open a subreport for sales 
  openSalesModal(monthData:any){
    let date = this.getFirstDateOfMonth(monthData.month, monthData.year)
    this.matDialog.open(SalesSubreportComponent, {
                data: {
                  rm_id:monthData.rm_id,
                  rm_name: monthData.rm,
                  date:date,
                },
                panelClass: 'custom-dialog-modal',
            }).afterClosed().subscribe(res => {
                if (res) {
                    // this.refreshItems();
                }
            })
  }

  getFirstDateOfMonth(month: number, year:any): string {
    const formattedMonth = String(month).padStart(2, '0'); // Ensure two-digit month
    return `01-${formattedMonth}-${year}`;
  }

  exportExcel(): void {
    // if (!Security.hasExportDataPermission(module_name.tech_rm_monthly_report)) {
    //   return this.alertService.showToast('error', messages.permissionDenied);
    // }
    const latestMonthNames = this.latestMonths.map(month => this.monthsName(month)); // Dynamic month names

    const formattedData = this.dataList.map(rm => {
      const monthData = rm.monthData.reduce((acc, item, index) => {
        acc[`month${index + 1}_currentMonthOnboard`] = item.currentMonthOnboard;
        acc[`month${index + 1}_currentMonthActivation`] = item.currentMonthActivation;
        acc[`month${index + 1}_currentMonthSales`] = item.currentMonthSales;
        return acc;
      }, {
        rm: rm.rm,
        average_onboard: rm.avg_Onboard,
        average_activation: rm.avg_Activation,
        average_sales: rm.avg_Sales,
      });
      return monthData;
    });

    const columns = [
      { header: 'RM', property: 'rm' },
      { header: 'Onboard', property: 'average_onboard' },
      { header: 'Activation', property: 'average_activation' },
      { header: 'Sales', property: 'average_sales' },
      ...latestMonthNames.map((name, index) => ([
        { header: `${name} Onboard`, property: `month${index + 1}_currentMonthOnboard` },
        { header: `${name} Activation`, property: `month${index + 1}_currentMonthActivation` },
        { header: `${name} Sales`, property: `month${index + 1}_currentMonthSales` },
      ])).flat() // Flatten the array of arrays into a single array
    ];

    Excel.export(
      'RM Monthly Analytics',
      columns,
      formattedData,
      'RM Monthly Analytics'
    );
  }



}

