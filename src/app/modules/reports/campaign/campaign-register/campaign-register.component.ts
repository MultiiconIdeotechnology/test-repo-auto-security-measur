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
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { filter_module_name, messages, module_name, Security } from 'app/security';
import { DateTime } from 'luxon';
import { Excel } from 'app/utils/export/excel';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { CampaignRegisterService } from 'app/services/campaign-register.service';
import { RefferralService } from 'app/services/referral.service';
import { LuxonDateAdapter } from '@angular/material-luxon-adapter';
import { cloneDeep } from 'lodash';

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

  index = {
    leads: -1,
    signUp: -1,
    turnover: -1,
    techGP: -1,
    travelGP: -1,
    totalGP: -1,
  };

  types = Types;
  selectedColumns: Column[] = [];
  exportCol: Column[] = [];
  activeFiltData: any = {};
  cols: Column[] = [];

  constructor(
    private campaignRegisterService: CampaignRegisterService,
    public _filterService: CommonFilterService,
    private referralService: RefferralService,
  ) {
    super(module_name.campaign_register)
    this.sortColumn = 'campaignName';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);

    this.selectedColumns = [
      { field: 'campaignName', header: 'Name' , type:Types.text  },
      { field: 'campaignCategory', header: 'Category', type:Types.text },
      { field: 'campaignType', header: 'Type', type:Types.text },
      { field: 'referralCode', header: 'Code', type:Types.text },
      { field: 'rm', header: 'RM', type:Types.select },
      { field: 'totalSpent', header: 'Total Spent', type: Types.number, fixVal: 2, class: 'text-right' },
      { field: 'leadCost', header: 'Lead Cost', type: Types.number, fixVal: 2, class: 'text-right' },
      { field: 'cac', header: 'CAC', type: Types.number, fixVal: 2, class: 'text-right' },
      { field: 'cRatio', header: 'C. Ratio %' , type: Types.number, fixVal: 2, class: 'text-right'},
      { field: 'advtRatio', header: 'Advt. Ratio', type: Types.number, fixVal: 2, class: 'text-right' },
      { field: 'leads', header: 'Leads', type: Types.number, fixVal: 2, class: 'text-right' },
      { field: 'signUp', header: 'Signup', type: Types.number, fixVal: 2, class: 'text-right' },
      { field: 'turnover', header: 'Turnover', type: Types.number, fixVal: 2, class: 'text-right' },
      { field: 'techGP', header: 'Tech GP', type: Types.number, fixVal: 2, class: 'text-right' },
      { field: 'travelGP', header: 'Travel GP', type: Types.number, fixVal: 2, class: 'text-right' },
      { field: 'totalGP', header: 'Total GP', type: Types.number, fixVal: 2, class: 'text-right' }
    ];

    this.cols.unshift(...this.selectedColumns);
    this.exportCol = cloneDeep(this.cols);
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
      this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns);
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
      this.selectedColumns = this.checkSelectedColumn(filterData['selectedColumns'] || [], this.selectedColumns); //  add new
      this.onColumnsChange(); //  add new
    } else { //  add new
      this.selectedColumns = this.checkSelectedColumn([], this.selectedColumns); //  add new
      this.onColumnsChange(); //  add new
    }
    //this.getColIndex();
  }

  getColIndex(): void { //  add new
    this.index.leads = this.selectedColumns.findIndex((item: any) => item.field == 'leads');
    this.index.signUp = this.selectedColumns.findIndex((item: any) => item.field == 'signUp');
    this.index.turnover = this.selectedColumns.findIndex((item: any) => item.field == 'turnover');
    this.index.techGP = this.selectedColumns.findIndex((item: any) => item.field == 'techGP');
    this.index.travelGP = this.selectedColumns.findIndex((item: any) => item.field == 'travelGP');
    this.index.totalGP = this.selectedColumns.findIndex((item: any) => item.field == 'totalGP');

  }

  onColumnsChange(): void {
    this._filterService.setSelectedColumns({ name: this.filter_table_name, columns: this.selectedColumns });
  }

  checkSelectedColumn(col: any[], oldCol: Column[]): any[] {
    if (col.length) return col;
    else {
      var Col = this._filterService.getSelectedColumns({ name: this.filter_table_name })?.columns || [];
      if (!Col.length)
        return oldCol;
      else
        return Col;
    }
  }

  isDisplayHashCol(): boolean {
    return this.selectedColumns.length > 0;
  }

  onSelectedColumnsChange(): void {
    this._filterService.setSelectedColumns({ name: this.filter_table_name, columns: this.selectedColumns });
    this.getColIndex(); //  add new
  }

  isAnyIndexMatch(): boolean { //  add new
    const len = this.selectedColumns?.length - 1;
    return len == this.index.leads || len == this.index.signUp || len == this.index.turnover || len == this.index.techGP || len == this.index.travelGP || len == this.index.totalGP;

  }

  isDisplayFooter(): boolean { //  add new
    return this.selectedColumns.some(x => x.field == 'leads' || x.field == 'signUp' || x.field == 'turnover' || x.field == 'techGP' || x.field == 'travelGP' || x.field == 'totalGP') ;
  }

  isNotDisplay(field: string): boolean { //  add new
    return field != "leads" && field != "signUp" && field != "turnover" && field != "techGP" && field != "travelGP" && field != "totalGP"
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

  displayColCount(): number {
    return this.selectedColumns.length + 1;
  }


  isValidDate(value: any): boolean {
    const date = new Date(value);
    return value && !isNaN(date.getTime());

  }
}
