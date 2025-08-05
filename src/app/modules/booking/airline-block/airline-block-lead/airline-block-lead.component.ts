import { Component } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { filter_module_name, messages, module_name, Security } from 'app/security';
import { EntityService } from 'app/services/entity.service';
import { ToasterService } from 'app/services/toaster.service';
import { Subscription, takeUntil } from 'rxjs';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { Linq } from 'app/utils/linq';
import { Routes } from 'app/common/const';
import { AirlineBlockService } from 'app/services/airline-block.service';

@Component({
  selector: 'app-airline-block-lead',
  standalone: true,
    imports: [
      CommonModule,
      NgIf,
      NgFor,
      DatePipe,
      FormsModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatIconModule,
      MatMenuModule,
      MatTableModule,
      MatSortModule,
      MatPaginatorModule,
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
      PrimeNgImportsModule,
    ],
  templateUrl: './airline-block-lead.component.html',
  styleUrls: ['./airline-block-lead.component.scss']
})
export class AirlineBlockLeadComponent extends BaseListingComponent {

  module_name = module_name.airline_block;
  filter_table_name = filter_module_name.airline_booking_booking;
  private settingsUpdatedSubscription: Subscription;
  dataList = [];
  total = 0;
  isFilterShow: boolean;
  cols: any;
  _selectedColumns: any;
  statusList = ['New', 'Completed', 'Confirmed', 'Rejected', 'Cancelled'];


  constructor(
    private airlineBlockService: AirlineBlockService,
    private matDialog: MatDialog,
    private toasterService: ToasterService,
    public _filterService: CommonFilterService,
    private conformationService: FuseConfirmationService,
    private entityService: EntityService,
  ) {
    super(module_name.holiday_lead);
    this.key = this.module_name;
    this.sortColumn = 'departure_date_time';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit() {

    // common filter
    this._filterService.selectionDateDropdown = "";
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
      this._filterService.selectionDateDropdown = "";

      if (resp['table_config']['entry_date_time']?.value != null) {
        resp['table_config']['entry_date_time'].value = new Date(resp['table_config']['entry_date_time'].value);
      }

      this.primengTable['filters'] = resp['table_config'];
      this._selectedColumns = resp['selectedColumns'] || [];
      this.isFilterShow = true;
      this.primengTable._filter();
    });
  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);

      if (filterData['table_config']['entry_date_time']?.value != null) {
        filterData['table_config']['entry_date_time'].value = new Date(filterData['table_config']['entry_date_time'].value);
      }

      this.primengTable['filters'] = filterData['table_config'];
      this._selectedColumns = filterData['selectedColumns'] || [];
      this.isFilterShow = true;
    }
  }

  viewData(record): void {
    if (!Security.hasViewDetailPermission(this.module_name)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    Linq.recirect('/'+ Routes.booking.airline_block_lead_path + '/details/' + record.id);
  }

  ngOnDestroy(): void {
    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }

    refreshItems(event?: any) {
      this.isLoading = true;
      let model = this.getNewFilterReq(event)
      this.airlineBlockService.getAirlineBlockLeadList(model).subscribe({
        next: (data) => {
          this.isLoading = false;
          this.dataList = data.data;
          this.totalRecords = data.total;
          if (this.dataList && this.dataList.length) {
            setTimeout(() => {
              this.isFrozenColumn('', ['reference_no']);
            }, 200);
          } else {
            setTimeout(() => {
              this.isFrozenColumn('', ['reference_no'], true);
            }, 200);
          }
        },
        error: (err) => {
          this.toasterService.showToast('error', err)
          this.isLoading = false;
        },
      });
    }
  
    getStatusColor(status: string): string {
      if (status == 'New' || status == 'Waiting for Token Payment') {
        return 'text-orange-600';
      } else if (status == 'Completed' || status == 'Token Payment Success' || status == 'Confirmed') {
        return 'text-green-600';
      } else if (status == 'Cancelled' || status == 'Rejected' || status == 'Token Payment Failed') {
        return 'text-red-600';
      } else {
        return '';
      }
    }
  
    getNodataText(): string {
      if (this.isLoading) return 'Loading...';
      else if (this.searchInputControl.value)
        return `no search results found for \'${this.searchInputControl.value}\'.`;
      else return 'No data to display';
    }
  
    exportExcel(): void {
      if (!Security.hasExportDataPermission(this.module_name)) {
        return this.alertService.showToast('error', messages.permissionDenied);
      }

      // let extraModel = this.getFilter();
      let newModel = this.getNewFilterReq({})
      // const filterReq = { ...extraModel, ...newModel };
      newModel['Take'] = this.totalRecords;
  
      this.airlineBlockService.getAirlineBlockLeadList(newModel).subscribe(data => {
        for (var dt of data.data) {
          dt.entry_date_time = dt.entry_date_time ? DateTime.fromISO(dt.entry_date_time).toFormat('dd-MM-yyyy HH:mm:ss') : '';
          dt.departure_date_time = dt.departure_date_time ? DateTime.fromISO(dt.departure_date_time).toFormat('dd-MM-yyyy HH:mm:ss') : '';
          dt.arrival_date_time = dt.arrival_date_time ? DateTime.fromISO(dt.arrival_date_time).toFormat('dd-MM-yyyy HH:mm:ss') : '';
        }
        Excel.export(
          'Airline Block Lead',
          [
            { header: 'Ref. No.', property: 'reference_no' },
            { header: 'Status', property: 'lead_status' },
            { header: 'Origin', property: 'origin' },
            { header: 'Destination', property: 'destination' },
            { header: 'Departure Date', property: 'departure_date_time' },
            { header: 'Arrival Date', property: 'arrival_date_time' },
            { header: 'Created', property: 'entry_date_time' },
          ],
          data.data, "Airline Block Lead", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 19 } }]);
      });
    }
  

}

