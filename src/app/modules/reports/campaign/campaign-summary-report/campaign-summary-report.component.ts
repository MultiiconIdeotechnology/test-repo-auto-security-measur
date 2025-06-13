import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AbstractControl, FormControl, FormsModule, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterOutlet } from '@angular/router';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { filter_module_name, messages, module_name, Security } from 'app/security';
import { DateTime } from 'luxon';
import { Excel } from 'app/utils/export/excel';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { CampaignRegisterService } from 'app/services/campaign-register.service';
import { RefferralService } from 'app/services/referral.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CampaignSummaryChartComponent } from './campaign-summary-chart/campaign-summary-chart.component';
import { LuxonDateAdapter } from '@angular/material-luxon-adapter';

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/yyyy',
  },
  display: {
    dateInput: 'MM/yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  selector: 'app-campaign-summary-report',
  standalone: true,
  imports: [
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
    MatDialogModule,
  ],
  templateUrl: './campaign-summary-report.component.html',
  styleUrls: ['./campaign-summary-report.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: LuxonDateAdapter,
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class CampaignSummaryReportComponent extends BaseListingComponent {
  @ViewChild(MatDatepickerToggle) toggle: MatDatepickerToggle<Date>;
  dataList = [];
  dataListTotals = [];
  total = 0;
  module_name = module_name.campaign_summary_report
  filter_table_name = filter_module_name.campaign_summary_report;
  private settingsUpdatedSubscription: Subscription;
  today = new Date();
  // public startDate = new FormControl(this.today);
  // public endDate = new FormControl(this.today);
  filterData: any;
  rmList: any = [];
  selectedRm: any;
  destroy$ = new Subject();
  expandedRows = {};
  subDataList: any = [];
  maxDate = new FormControl(DateTime.now().startOf('month').toJSDate());
  startDate = new FormControl(DateTime.now().startOf('month').minus({ months: 3 }).toJSDate());
  endDate = new FormControl(DateTime.now().startOf('month').toJSDate());

  constructor(
    private campaignRegisterService: CampaignRegisterService,
    public _filterService: CommonFilterService,
    private matDialog: MatDialog,
  ) {
    super(module_name.campaign_register)
    this.sortColumn = 'campaignName';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  isFilterShow: boolean = false;

  ngOnInit() {
    this._filterService.rmListSubject$.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      this.rmList = res;
    })

    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      this.selectedRm = resp['table_config']['rm']?.value;
      // this.sortColumn = resp['sortColumn'];
      // this.primengTable['_sortField'] = resp['sortColumn'];
      this.primengTable['filters'] = resp['table_config'];
      this.isFilterShow = true;
      this.primengTable._filter();
    });

    this.startDate.valueChanges.subscribe((res:any) => {
      if(res){
        this.subDataList = [];
      }
    })

    this.endDate.valueChanges.subscribe((res: any) => {
      if (res) {
        this.subDataList = [];
        this.refreshItems();
      }
    })
  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      this.isFilterShow = true;
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      this.selectedRm = filterData['table_config']['rm']?.value;
      this.primengTable['filters'] = filterData['table_config'];
    }
  }

  toggleRow(id: any): void {
    this.expandedRows[id] = !this.expandedRows[id];
  }


  // setMonthAndYear(normalizedMonthAndYear: Date, datepicker: MatDatepicker<Date>) {
  //   const ctrlValue = DateTime.fromJSDate(this.startDate.value!);
  //   const updatedValue = ctrlValue
  //     .set({ month: normalizedMonthAndYear.getMonth() + 1 })
  //     .set({ year: normalizedMonthAndYear.getFullYear() })
  //     .startOf('month');
  //   this.startDate.setValue(updatedValue.toJSDate());
  //   console.log("this.date", this.startDate.value)
  //   datepicker.close();
  // }

  setMonthAndYear(normalizedMonthAndYear: any, datepicker: MatDatepicker<Date>) {
    let dateTime: DateTime;

    if (normalizedMonthAndYear instanceof Date) {
      dateTime = DateTime.fromJSDate(normalizedMonthAndYear);
    } else {
      dateTime = DateTime.fromObject({
        month: normalizedMonthAndYear.month, 
        year: normalizedMonthAndYear.year
      });
    }

    const updatedValue = dateTime.startOf('month');
    this.startDate.setValue(updatedValue.toJSDate());
    datepicker.close();
  }

  setFromMonthAndYear(normalizedMonthAndYear: any, datepicker: MatDatepicker<Date>) {
    let dateTime: DateTime;

    if (normalizedMonthAndYear instanceof Date) {
      dateTime = DateTime.fromJSDate(normalizedMonthAndYear);
    } else {
      dateTime = DateTime.fromObject({
        month: normalizedMonthAndYear.month, 
        year: normalizedMonthAndYear.year
      });
    }

    const updatedValue = dateTime.startOf('month');
    this.endDate.setValue(updatedValue.toJSDate());
    datepicker.close();
  }

  refreshItems(event?: any): void {
    const fromDate = this.startDate.value;
    const toDate = this.endDate.value;
    const today = new Date();

    if (!fromDate || !toDate) {
      this.alertService.showToast('error', 'Please select both dates.');
      return;
    }

    if (fromDate > toDate) {
      this.alertService.showToast('error', 'From Date cannot be greater than To Date.');
      return;
    }

    if (toDate > today) {
      this.alertService.showToast('error', 'To Date cannot be in the future.');
      return;
    }
    this.isLoading = true;

    const request = this.getNewFilterReq(event);
    request['FromDate'] = DateTime.fromJSDate(this.startDate.value).toFormat('yyyy-MM-dd');
    request['ToDate'] = DateTime.fromJSDate(this.endDate.value).toFormat('yyyy-MM-dd');

    this.campaignRegisterService.getCampaignSummaryReport(request).subscribe({
      next: (data) => {
        this.dataListTotals = data;
        this.dataList = data.data;
        this.totalRecords = data.total;
        if (!this.subDataList?.length) {
          this.subTableData();
        } else {
          this.dataList = this.manageSubTableData(this.dataList)
        }
        this.isLoading = false;
      }, error: (err) => {
        this.alertService.showToast('error', err)
        this.isLoading = false
      }
    });
  }

  // api for mothwise sub table data(expanded table)
  subTableData() {
    let request = {};
    request['FromDate'] = DateTime.fromJSDate(this.startDate.value).toFormat('yyyy-MM-dd');
    request['ToDate'] = DateTime.fromJSDate(this.endDate.value).toFormat('yyyy-MM-dd');
    this.campaignRegisterService.getCampaignSummaryMonthwiseReport(request).subscribe({
      next: (data) => {
        // this.dataListTotals = data;
        this.subDataList = data.data;
        this.dataList = this.manageSubTableData(this.dataList);
        // this.isLoading = false;
      }, error: (err) => {
        this.alertService.showToast('error', err)
        this.isLoading = false
      }
    });
  }

  // merging subTableData on main table data based on id match
  manageSubTableData(dataList: any) {
    for (let el of dataList) {
      el['monthWiseData'] = [];
      for (let item of this.subDataList) {
        if (item.id == el.id) {
          el['monthWiseData'].push(item);
        }
      }
    }
    return dataList;
  }

  //refershing data
  loadingTableData() {
    // this.subDataList = [];
    this.refreshItems();
  }

  onChart(record: any, key: string, name: string) {
    if (!record[key] && record[key] == 0) {
      return;
    }

    this.matDialog.open(CampaignSummaryChartComponent, {
      data: { record: record, key: key, hoverName: name },
      panelClass: 'zero-dialog',
      disableClose: true,
      backdropClass: 'custom-dialog-backdrop',
      maxWidth: '1260px',
      minWidth: '900px'
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
    if (!Security.hasExportDataPermission(module_name.campaign_summary_report)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    let dataList = [];
    const filterReq = this.getNewFilterReq({});
    filterReq['Take'] = this.totalRecords;
    filterReq['FromDate'] = DateTime.fromJSDate(this.startDate.value).toFormat('yyyy-MM-dd');
    filterReq['ToDate'] = DateTime.fromJSDate(this.endDate.value).toFormat('yyyy-MM-dd');

    let monthPayload = {
      fromDate: DateTime.fromJSDate(this.startDate.value).toFormat('yyyy-MM-dd'),
      toDate: DateTime.fromJSDate(this.endDate.value).toFormat('yyyy-MM-dd')
    }

    this.campaignRegisterService.getCampaignSummaryReport(filterReq).subscribe(data => {
      dataList = data.data;
      dataList = this.manageSubTableData(dataList);

      const exportData = [];

      for (let el of dataList) {
        // Push main row
        exportData.push({
          rowType: 'Main',
          id: el.id,
          campaignName: el.campaignName,
          campaignCategory: el.campaignCategory,
          totalSpent: el.totalSpent,
          leads: el.leads,
          signUp: el.signUp,
          techGP: el.techGP,
          monthName: '',
          year: ''
        });

        // Push each monthWise row
        if (el.monthWiseData && el.monthWiseData.length) {
          for (let month of el.monthWiseData) {
            exportData.push({
              rowType: 'Month',
              id: month.id,
              campaignName: month.monthName,
              campaignCategory: month.campaignCategory,
              totalSpent: month.totalSpent,
              leads: month.leads,
              signUp: month.signUp,
              techGP: month.techGP,
              monthName: month.monthName,
              year: month.year
            });
          }
        }
      }
      Excel.export(
        'Campaign Summary',
        [
          { header: 'Name', property: 'campaignName' },
          { header: 'Category', property: 'campaignCategory' },
          { header: 'Leads', property: 'leads' },
          { header: 'Signup', property: 'signUp' },
          { header: 'Tech GP', property: 'techGP' },
          { header: 'Total Spent', property: 'totalSpent' },
        ],
        exportData, "Campaign Summary", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }]);

    });

  }

  ngOnDestroy() {
    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }

    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
