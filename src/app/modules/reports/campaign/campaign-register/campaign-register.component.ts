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
import { filter_module_name, messages, module_name, Security } from 'app/security';
import { CampaignSummaryService } from 'app/services/campaign-summary.service';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DateTime } from 'luxon';
import { dateRange } from 'app/common/const';
import { CommonUtils } from 'app/utils/commonutils';
import { Excel } from 'app/utils/export/excel';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { Subscription } from 'rxjs';


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
  styleUrls: ['./campaign-register.component.scss']
})

export class CampaignRegisterComponent extends BaseListingComponent {
  dataList = [];
    dataListTotals = [];
    total = 0;
    module_name = module_name.campaign_summary
    filter_table_name = filter_module_name.campaign_summary;
    private settingsUpdatedSubscription: Subscription;
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
      public _filterService: CommonFilterService
      // private clipboard: Clipboard
    ) {
      super(module_name.campaign_summary)
      // this.cols = this.columns.map(x => x.key);
      this.key = 'campaign_name';
      this.sortColumn = 'campaign_name';
      this.Mainmodule = this;
      this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    isFilterShow: boolean = false;
  
    ngOnInit() {
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      // this.sortColumn = resp['sortColumn'];
      // this.primengTable['_sortField'] = resp['sortColumn'];
      this.primengTable['filters'] = resp['table_config'];
      this.isFilterShow = true;
      this.primengTable._filter();
    });
    }
  
    ngAfterViewInit(){
      // Defult Active filter show
      if(this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
          this.isFilterShow = true;
          let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
          this.primengTable['filters'] = filterData['table_config'];
      }
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
  
    ngOnDestroy() {
      if (this.settingsUpdatedSubscription) {
        this.settingsUpdatedSubscription.unsubscribe();
        this._filterService.activeFiltData = {};
      }
    }
}
