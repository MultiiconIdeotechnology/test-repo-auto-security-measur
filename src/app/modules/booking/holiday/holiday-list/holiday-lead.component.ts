import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
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
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { filter_module_name, messages, module_name, Security } from 'app/security';
import { AgentService } from 'app/services/agent.service';
import { EntityService } from 'app/services/entity.service';
import { ForexService } from 'app/services/forex.service';
import { HolidayLeadService } from 'app/services/holiday-lead.service';
import { SupplierApiService } from 'app/services/supplier-api.service';
import { SupplierService } from 'app/services/supplier.service';
import { ToasterService } from 'app/services/toaster.service';
import { Excel } from 'app/utils/export/excel';
import { Linq } from 'app/utils/linq';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-holiday-lead-list',
  templateUrl: './holiday-lead.component.html',
  styleUrls: ['./holiday-lead.component.css'],
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
  ]
})
export class HolidayLeadComponent extends BaseListingComponent {

  module_name = module_name.holiday_lead;
  filter_table_name = filter_module_name.holiday_lead_service_booking;
  private settingsUpdatedSubscription: Subscription;
  dataList = [];
  total = 0;
  isFilterShow: boolean;
  cols: any;
  agentList: any[];
  selectedAgent: any;
  _selectedColumns: any;
  statusList = ['New', 'Completed', 'Confirmed', 'Rejected', 'Cancelled', 'Waiting for Token Payment', 'Token Payment Success', 'Token Payment Failed'];
  supplierList: any[] = [];
  // leadFromList = ['WEB', 'android', 'ios'];
  bookingByList = ['B2B', 'B2C']


  constructor(
    private HolidayLeadService: HolidayLeadService,
    private agentService: AgentService,
    private toasterService: ToasterService,
    // private supplierService: SupplierService,
    public _filterService: CommonFilterService,
  ) {
    super(module_name.holiday_lead);
    this.key = this.module_name;
    this.sortColumn = 'entry_date_time';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit() {
    this.getSupplierList('');

    this.agentList = this._filterService.agentListById;

    // common filter
    this._filterService.updateSelectedOption('');
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
      this._filterService.updateSelectedOption('');
      this.selectedAgent = resp['table_config']['agent_id_filters']?.value;
      if (this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }

      if (resp['table_config']['entry_date_time']?.value != null && resp['table_config']['entry_date_time'].value.length) {
        this._filterService.updateSelectedOption('custom_date_range');
        this._filterService.rangeDateConvert(resp['table_config']['entry_date_time']);
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
      this.selectedAgent = filterData['table_config']['agent_id_filters']?.value;
      if (this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }

      if (filterData['table_config']['entry_date_time']?.value != null && filterData['table_config']['entry_date_time'].value.length) {
        this._filterService.updateSelectedOption('custom_date_range');
        this._filterService.rangeDateConvert(filterData['table_config']['entry_date_time']);
      }

      this.primengTable['filters'] = filterData['table_config'];
      this._selectedColumns = filterData['selectedColumns'] || [];
      this.isFilterShow = true;
    }
  }

  view(record): void {
    if (!Security.hasViewDetailPermission(module_name.bookingsHoliday)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    Linq.recirect('/booking/holiday-lead/details/' + record.id);
  }

  ngOnDestroy(): void {
    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }

  getAgent(value: string) {
    this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
      this.agentList = data;

      for (let i in this.agentList) {
        this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`
      }
    });
  }

  // Api to get the Supplier list data
  getSupplierList(value: string, bool = true) {
    this.HolidayLeadService.getSupplierCombo(value, 'Holiday').subscribe((data: any) => {
      this.supplierList = data;
    });
  }

  refreshItems(event?: any) {
    this.isLoading = true;
    // let extraModel = this.getFilter();
    let model = this.getNewFilterReq(event)
    // var model = { ...extraModel, ...newModel };
    this.HolidayLeadService.getHolidayLeads(model).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.dataList = data.data;
        this.totalRecords = data.total;
        if (this.dataList && this.dataList.length) {
          setTimeout(() => {
            this.isFrozenColumn('', ['is_read_by_supplier', 'reference_no']);
          }, 200);
        } else {
          setTimeout(() => {
            this.isFrozenColumn('', ['is_read_by_supplier', 'reference_no'], true);
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

    // let extraModel = this.getFilter();
    let newModel = this.getNewFilterReq({})
    // const filterReq = { ...extraModel, ...newModel };
    newModel['Take'] = this.totalRecords;

    this.HolidayLeadService.getHolidayLeads(newModel).subscribe(data => {
      for (var dt of data.data) {
        dt.entry_date_time = dt.entry_date_time ? DateTime.fromISO(dt.entry_date_time).toFormat('dd-MM-yyyy HH:mm:ss') : '';
        dt.start_date = dt.start_date ? DateTime.fromISO(dt.start_date).toFormat('dd-MM-yyyy HH:mm:ss') : '';
        dt.end_date = dt.end_date ? DateTime.fromISO(dt.end_date).toFormat('dd-MM-yyyy HH:mm:ss') : '';
      }
      Excel.export(
        'Holiday Lead',
        [
          { header: 'Ref. No.', property: 'reference_no' },
          { header: 'Status', property: 'lead_status' },
          { header: 'Product Name', property: 'product_name' },
          { header: 'Supplier', property: 'supplier_name' },
          { header: 'Agent', property: 'agent_name' },
          { header: 'Start Date', property: 'start_date' },
          { header: 'End Date', property: 'end_date' },
          { header: 'No Of Nights', property: 'no_of_nights' },
          { header: 'Created', property: 'entry_date_time' },
          { header: 'Lead From', property: 'lead_from' },
          { header: 'Booking By', property: 'booking_by' },

        ],
        data.data, "Holiday Lead", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 19 } }]);
    });
  }

}
