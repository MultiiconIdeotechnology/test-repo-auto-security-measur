import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS, MatNativeDateModule } from '@angular/material/core';
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
  selector: 'app-campaign-register',
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
  templateUrl: './campaign-register.component.html',
  styleUrls: ['./campaign-register.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: LuxonDateAdapter,
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})

export class CampaignRegisterComponent extends BaseListingComponent {
  @ViewChild(MatDatepickerToggle) toggle: MatDatepickerToggle<Date>;
  dataList = [];
  dataListTotals = [];
  total = 0;
  module_name = module_name.campaign_register
  filter_table_name = filter_module_name.campaign_register;
  private settingsUpdatedSubscription: Subscription;
  // today = new Date();
  filterData: any;
  rmList: any = [];
  selectedRm: any;
  destroy$ = new Subject();
  startDate = new FormControl(DateTime.now().startOf('month').minus({ months: 3 }).toJSDate());
  endDate = new FormControl(DateTime.now().startOf('month').toJSDate());

  constructor(
    private campaignRegisterService: CampaignRegisterService,
    public _filterService: CommonFilterService,
    private referralService: RefferralService,
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

    this.endDate.valueChanges.subscribe((res: any) => {
      if (res) {
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

    this.campaignRegisterService.getcampaignRegisterReport(request).subscribe({
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


  // Api to get the Employee list data
  getEmployeeList(value: string) {
    this.referralService.getEmployeeLeadAssignCombo(value).subscribe((data: any) => {
      this.rmList = data;
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
    if (!Security.hasExportDataPermission(module_name.campaign_register)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const filterReq = this.getNewFilterReq({});
    filterReq['Take'] = this.totalRecords;
    // filterReq['Filter'] = this.searchInputControl.value ? this.searchInputControl.value : ""
    filterReq['FromDate'] = DateTime.fromJSDate(this.startDate.value).toFormat('yyyy-MM-dd');
    filterReq['ToDate'] = DateTime.fromJSDate(this.endDate.value).toFormat('yyyy-MM-dd');

    this.campaignRegisterService.getcampaignRegisterReport(filterReq).subscribe(data => {
      Excel.export(
        'Campaign Register',
        [
          { header: 'Name', property: 'campaignName' },
          { header: 'Category', property: 'campaignCategory' },
          { header: 'Type', property: 'campaignType' },
          { header: 'Code', property: 'referralCode' },
          { header: 'RM', property: 'rm' },
          { header: 'Total Spent', property: 'totalSpent' },
          { header: 'Lead Cost', property: 'leadCost' },
          { header: 'CAC', property: 'cac' },
          { header: 'C. Ratio %', property: 'cRatio' },
          { header: 'Advt. Ratio', property: 'advtRatio' },
          { header: 'Leads', property: 'leads' },
          { header: 'Sign Up', property: 'signUp' },
          { header: 'Turnover', property: 'turnover' },
          { header: 'Tech GP', property: 'techGP' },
          { header: 'Travel GP', property: 'travelGP' },
          { header: 'Total GP', property: 'totalGP' },
        ],
        data.data, "Campaign Register", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }]);
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
