import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';
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
import { messages, module_name, Security } from 'app/security';
import { CampaignSummaryService } from 'app/services/campaign-summary.service';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DateTime } from 'luxon';
import { dateRange } from 'app/common/const';
import { CommonUtils } from 'app/utils/commonutils';
import { Excel } from 'app/utils/export/excel';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';

@Component({
  selector: 'app-campaign-summary',
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
  templateUrl: './campaign-summary.component.html',
  styleUrls: ['./campaign-summary.component.scss'],
  styles: [`
    .tbl-grid {
      grid-template-columns: 40px 200px 150px 150px 200px 80px 120px 120px 140px 130px 150px;
    }
    `],
})
export class CampaignSummaryComponent extends BaseListingComponent implements OnDestroy {

  dataList = [];
  dataListTotals = [];
  total = 0;
  module_name = module_name.campaign_summary

  public dateRanges = [];
  public date = new FormControl();
  public startDate = new FormControl();
  public endDate = new FormControl();
  public StartDate: any;
  public EndDate: any;
  filterData: any;
  DR = dateRange;
  @ViewChild(MatDatepickerToggle) toggle: MatDatepickerToggle<Date>;


  constructor(
    private confirmService: FuseConfirmationService,
    private router: Router,
    private campaignSummaryService: CampaignSummaryService,
    private matDialog: MatDialog,
    // private clipboard: Clipboard
  ) {
    super(module_name.campaign_summary)
    // this.cols = this.columns.map(x => x.key);
    this.key = 'campaign_name';
    this.sortColumn = 'leads';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this.dateRanges = CommonUtils.valuesArray(dateRange);
    this.date.patchValue(dateRange.lastWeek);
    this.updateDate(dateRange.lastWeek,false)

  }

  columns = [
    { key: 'campaign_name', name: 'Campaign Name', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: true, is_boolean: false, tooltip: true, campName: false },
    { key: 'campaign_type', name: 'Campaign Type', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'campaign_code', name: 'Campaign Code', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, iscolor: false },
    { key: 'relationship_manager_name', name: 'RM', isRM: true, is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'leads', name: 'Leads', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, isNumber: true },
    { key: 'no_of_signup', name: 'Signup', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, isamount: true, isNumber: true },
    { key: 'turnover', name: 'Turnover', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, isNumber: true },
    { key: 'tech_GP', name: 'Tech GP', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, isNumber: true },
    { key: 'travel_GP', name: 'Travel GP', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, isNumber: true },
    { key: 'total_GP', name: 'Total GP', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, isNumber: true },
  ]
  isFilterShow: boolean = false;

  ngOnInit() {

  }



  refreshItems(event?:any): void {
    this.isLoading = true;

    const request = this.getNewFilterReq(event);
    request['FromDate'] = DateTime.fromJSDate(this.startDate.value).toFormat('yyyy-MM-dd');
    request['ToDate'] = DateTime.fromJSDate(this.endDate.value).toFormat('yyyy-MM-dd');

    let extraModel = this.getFilter();
        let newModel = this.getNewFilterReq(event);
        let model = {...extraModel, ...newModel}

    this.campaignSummaryService.getcampaignReport(request).subscribe({
      next: (data) => {
        this.dataListTotals = data;
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

  getFilter(): any {
    const filterReq = GridUtils.GetFilterReq(
      this._paginator,
      this.sort,
      this.searchInputControl.value,
    );
    return filterReq;
  }

  exportExcel(): void {
    if (!Security.hasExportDataPermission(module_name.campaign_summary)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const filterReq = this.getNewFilterReq({});
    filterReq['Take'] = this.totalRecords;
    // filterReq['Filter'] = this.searchInputControl.value ? this.searchInputControl.value : ""
    filterReq['FromDate'] = DateTime.fromJSDate(this.startDate.value).toFormat('yyyy-MM-dd');
    filterReq['ToDate'] = DateTime.fromJSDate(this.endDate.value).toFormat('yyyy-MM-dd');

    this.campaignSummaryService.getcampaignReport(filterReq).subscribe(data => {
      Excel.export(
        'Campaign Summary',
        [
          { header: 'Name', property: 'campaign_name' },
          { header: 'Type', property: 'campaign_type' },
          { header: 'Code', property: 'campaign_code' },
          { header: 'RM', property: 'relationship_manager_name' },
          { header: 'Leads', property: 'leads' },
          { header: 'Signup', property: 'signup' },
          { header: 'Turnover', property: 'turnover' },
          { header: 'Tech GP', property: 'tech_GP' },
          { header: 'Travel GP', property: 'travel_GP' },
          { header: 'Total GP', property: 'total_GP' }
        ],
        data.data, "Campaign Summary", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }]);
    });
  }
}
