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
import { dateRangeContracting } from 'app/common/const';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { module_name, filter_module_name, messages, Security } from 'app/security';
import { Subscription } from 'rxjs';
import { AccountService } from 'app/services/account.service';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { CommonUtils } from 'app/utils/commonutils';
import { DateTime } from 'luxon';
import { Excel } from 'app/utils/export/excel';

@Component({
  selector: 'app-agent-wise-service-wise',
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
  templateUrl: './agent-wise-service-wise.component.html',
  styleUrls: ['./agent-wise-service-wise.component.scss']
})
export class AgentWiseServiceWiseComponent extends BaseListingComponent implements OnDestroy {

  dataList = [];
  dataListTotals = [];

  DR = dateRangeContracting;
  public startDate = new FormControl();
  public endDate = new FormControl();
  public StartDate: any;
  public EndDate: any;
  public dateRangeContractings = [];
  public date = new FormControl();

  module_name = module_name.agent_wise_service_wise
  filter_table_name = filter_module_name.agent_wise_service_wise;

  private settingsUpdatedSubscription: Subscription;
  isFilterShow: boolean = false;

  constructor(
    private confirmService: FuseConfirmationService,
    private router: Router,
    private accountService: AccountService,
    private matDialog: MatDialog,
    public _filterService: CommonFilterService
  ) {
    super(module_name.agent_wise_service_wise)
    this.key = 'supplier';
    this.sortColumn = 'air_volume';
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

    this.accountService.allServiceAnalysis(request).subscribe({
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
    if (!Security.hasExportDataPermission(module_name.agent_wise_service_wise)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    const filterReq = this.getNewFilterReq({});
    filterReq['From_Date'] = DateTime.fromJSDate(this.startDate.value).toFormat('yyyy-MM-dd');
    filterReq['To_Date'] = DateTime.fromJSDate(this.endDate.value).toFormat('yyyy-MM-dd');
    filterReq['Take'] = this.totalRecords;

    this.accountService.allServiceAnalysis(filterReq).subscribe(data => {
      const formattedData = data.data.map(dt => ({
        agent: dt.agent_name || "",  // Use agent_name here as "agent"
        agentId: dt.agent_id || "",  // Use agent_name here as "agent"
        salesPerson: dt.sales_person || "",
        airVolume: dt.air_volume || 0.0,
        airProfit: dt.air_profit || 0.0,
        airPax: dt.air_pax || 0.0,
        busVolume: dt.bus_volume || 0.0,
        busProfit: dt.bus_profit || 0.0,
        busPax: dt.bus_pax || 0.0,
        hotelVolume: dt.hotel_volume || 0.0,
        hotelProfit: dt.hotel_profit || 0.0,
        hotelPax: dt.hotel_pax || 0.0,
        visaVolume: dt.visa_volume || 0.0,
        visaProfit: dt.visa_profit || 0.0,
        visaPax: dt.visa_pax || 0.0,
        otherServiceVolume: dt.other_service_volume || 0.0,
        otherServiceProfit: dt.other_service_profit || 0.0,
        otherServicePax: dt.other_service_pax || 0.0,
        techProductVolume: dt.tech_product_volume || 0.0,
        techProductProfit: dt.tech_product_profit || 0.0,
        techProductPax: dt.tech_product_pax || 0.0,
        totalVolume: dt.total_volume || 0.0,
        totalProfit: dt.total_profit || 0.0,
        totalPax: dt.total_pax || 0.0,
        whiteLabel: dt.whitelabel || ""
      }));

      // Define the columns for the Excel export
      const columns = [
        { header: 'Agent', property: 'agent' },
        { header: 'Agent', property: 'agentId' },
        { header: 'Sales Person', property: 'salesPerson' },

        { header: 'Air Volume', property: 'airVolume' },
        { header: 'Air Profit', property: 'airProfit' },
        { header: 'Air Pax', property: 'airPax' },

        { header: 'Hotel Volume', property: 'hotelVolume' },
        { header: 'Hotel Profit', property: 'hotelProfit' },
        { header: 'Hotel Pax', property: 'hotelPax' },

        { header: 'Bus Volume', property: 'busVolume' },
        { header: 'Bus Profit', property: 'busProfit' },
        { header: 'Bus Pax', property: 'busPax' },
        { header: 'Visa Volume', property: 'visaVolume' },
        { header: 'Visa Profit', property: 'visaProfit' },
        { header: 'Visa Pax', property: 'visaPax' },

        { header: 'Other Service Volume', property: 'otherServiceVolume' },
        { header: 'Other Service Profit', property: 'otherServiceProfit' },
        { header: 'Other Service Pax', property: 'otherServicePax' },
        { header: 'Tech Product Volume', property: 'techProductVolume' },
        { header: 'Tech Product Profit', property: 'techProductProfit' },
        { header: 'Tech Product Pax', property: 'techProductPax' },

        { header: 'Total Volume', property: 'totalVolume' },
        { header: 'Total Profit', property: 'totalProfit' },
        { header: 'Total Pax', property: 'totalPax' },

        { header: 'White Label', property: 'whiteLabel' }
      ];

      // Create a shortened, dynamic sheet name
      const fromDate = DateTime.fromJSDate(this.startDate.value).toFormat('dd-MM-yyyy');
      const toDate = DateTime.fromJSDate(this.endDate.value).toFormat('dd-MM-yyyy');
      const sheetName = `Agent Wise Service Wise ${fromDate} to ${toDate}`.substring(0, 400);

      // Export the data using the custom Excel utility
      Excel.export(
        'Agent Wise Service Wise',  // File name
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

}
