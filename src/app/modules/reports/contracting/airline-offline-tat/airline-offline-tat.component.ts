import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterOutlet } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { dateRange } from 'app/common/const';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { filter_module_name, messages, module_name, Security } from 'app/security';
import { AirlineSummaryService } from 'app/services/airline-summary.service';
import { CommonUtils } from 'app/utils/commonutils';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Subscription } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { FlightTabService } from 'app/services/flight-tab.service';
import { Linq } from 'app/utils/linq';

@Component({
  selector: 'app-airline-offline-tat',
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
  templateUrl: './airline-offline-tat.component.html',
  styleUrls: ['./airline-offline-tat.component.scss']
})
export class AirlineOfflineTatComponent extends BaseListingComponent implements OnDestroy{

  dataList = []
  supplierList: any[] = [];


  module_name = module_name.airline_offline
  filter_table_name = filter_module_name.airline_offline;
  private settingsUpdatedSubscription: Subscription;
  isFilterShow: boolean = false;

  // tatList = [ 'In Time', 'Delayer'];
  statusList = ['Confirmed', 'Assign To Refund', 'Cancelled', 'Partially Cancelled', 'Booking Failed', 'Rejected'];
  typeList = ['Domestic','Internation', 'Offshore'];

  constructor(
    private confirmService: FuseConfirmationService,
    private router: Router,
    private airlineSummaryService: AirlineSummaryService,
    private matDialog: MatDialog,
    public _filterService: CommonFilterService,
    private flighttabService: FlightTabService,

    // private clipboard: Clipboard
  ) {
    super(module_name.airline_offline)
    // this.cols = this.columns.map(x => x.key);
    this.key = 'tat';
    this.sortColumn = 'tat';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit() {
    this.getSupplierList()
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
      // this.sortColumn = resp['sortColumn'];
      // this.primengTable['_sortField'] = resp['sortColumn'];
      this.primengTable['filters'] = resp['table_config'];
      this.isFilterShow = true;
      this.primengTable._filter();
    });
    }

    viewData(record): void {
        console.log(record);
        if (!Security.hasViewDetailPermission(module_name.airline_offline)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        Linq.recirect('/booking/flight/details/' + record.id);
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
    // request['From_Date'] = '';
    // request['To_Date'] = '';

    this.airlineSummaryService.airlineOfflineTatAnalysis(request).subscribe({
      next: (data) => {
        this.dataList = data.data;
        this.totalRecords = data.total;
        this.isLoading = false;
      }, error: (err) => {
        this.alertService.showToast('error', err)
        this.isLoading = false
      }
    });
  }

     // Api to get the Supplier List
     getSupplierList() {
      this.flighttabService.getSupplierBoCombo('Airline').subscribe((data: any) => {
          this.supplierList = data;

          for (let i in this.supplierList) {
              this.supplierList[i].id_by_value = this.supplierList[i].company_name;
          }
      })
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }


   exportExcel(): void {
    if (!Security.hasExportDataPermission(module_name.airline_offline)) {
        return this.alertService.showToast('error', messages.permissionDenied);
    }

    const filterReq = this.getNewFilterReq({});
    // filterReq['From_Date'] = '';
    // filterReq['To_Date'] = '';
    filterReq['Take'] = this.totalRecords;

    this.airlineSummaryService.airlineOfflineTatAnalysis(filterReq).subscribe(data => {
      for (var dt of data.data) {
        dt.ticketingTime = dt.ticketingTime ? DateTime.fromISO(dt.ticketingTime).toFormat('dd-MM-yyyy') : '';
        dt.startDate = dt.startDate ? DateTime.fromISO(dt.startDate).toFormat('dd-MM-yyyy') : '';
        dt.endDate = dt.endDate ? DateTime.fromISO(dt.endDate).toFormat('dd-MM-yyyy') : '';
      }
      Excel.export(
        'Airline Offline TAT Analysis',
        [
          { header: 'Ticketing Time', property: 'ticketingTime' },
          { header: 'Bonton Booking No.', property: 'bookingNo' },
          { header: 'Supplier Ref. No.', property: 'supplierRefNo' },
          { header: 'supplier', property: 'supplier' },
          { header: 'Status', property: 'bookingStatus' },
          { header: 'Start Date', property: 'startDate' },
          { header: 'End Date', property: 'endDate' },
          { header: 'TAT', property: 'tat' },
          { header: 'Type', property: 'type' },
        ],
        data.data, "Airline Offline TAT Analysis", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }]);
    });
  }
}
