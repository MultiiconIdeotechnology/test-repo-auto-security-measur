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
import { module_name, filter_module_name, messages, Security } from 'app/security';
import { Subscription } from 'rxjs';
import { CabService } from 'app/services/cab.service';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { AgentService } from 'app/services/agent.service';
import { EntityService } from 'app/services/entity.service';
import { ToasterService } from 'app/services/toaster.service';
import { Linq } from 'app/utils/linq';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { ForexService } from 'app/services/forex.service';

@Component({
  selector: 'app-cab-list',
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
  templateUrl: './cab-list.component.html',
  styleUrls: ['./cab-list.component.scss']
})
export class CabListComponent extends BaseListingComponent {

  module_name = module_name.cab_lead;
  filter_table_name = filter_module_name.cab_lead_service_booking;
  private settingsUpdatedSubscription: Subscription;
  dataList = [];
  total = 0;
  isFilterShow: boolean;
  cols: any;
  agentList: any[];
  selectedAgent: any;
  _selectedColumns: any;
  statusList = ['New', 'Confirmed', 'Completed', 'Rejected', 'Cancelled', 'Waiting for Token Payment', 'Token Payment Success', 'Token Payment Failed'];
  typeList = ['Outstation One Way', 'Outstation Round Trip', 'Airport Transfer', 'Hourly Rental'];

  STATUS_COLORS: { [key: string]: string } = {
    'New': '#007bff', // Blue
    'Completed': '#28a745', // Green
    'Confirmed':'#28a745',
    'Rejected': '#dc3545', // Red
    'Cancelled': '#6c757d', // Gray
    'Waiting for Token Payment': '#ffc107', // Yellow
    'Token Payment Success': '#17a2b8', // Teal
    'Token Payment Failed': '#ff5722' // Orange
  };;
  

  supplierList: any[] = [];

  constructor(
    private cabService: CabService,
    private matDialog: MatDialog,
    private agentService: AgentService,
    private forexService: ForexService,
    private toasterService: ToasterService,
    public _filterService: CommonFilterService,
    private conformationService: FuseConfirmationService,
    private entityService: EntityService,
  ) {
    super(module_name.cab_lead);
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

  confirmdetail(record): void {
    if (!Security.hasViewDetailPermission(module_name.bookingsCab)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    Linq.recirect('/booking/cab/details/' + record);
  }

  ngOnDestroy(): void {
    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }

  // Api to get the Supplier list data
  getSupplierList(value: string, bool = true) {
    this.forexService.getSupplierForexCombo(value).subscribe((data: any) => {
      this.supplierList = data;
    });
  }

  getAgent(value: string) {
    this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
      this.agentList = data;

      for (let i in this.agentList) {
        this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`
      }
    });
  }


  refreshItems(event?: any) {
    this.isLoading = true;
    let model = this.getNewFilterReq(event)
    this.cabService.getCabLeadsList(model).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.dataList = data.data;
        this.totalRecords = data.total;
        if (this.dataList && this.dataList.length) {
          setTimeout(() => {
            this.isFrozenColumn('', ['', 'reference_no']);
          }, 200);
        } else {
          setTimeout(() => {
            this.isFrozenColumn('', ['', 'reference_no'], true);
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

    let newModel = this.getNewFilterReq({})
    newModel['Take'] = this.totalRecords;

    this.cabService.getCabLeadsList(newModel).subscribe(data => {
      for (var dt of data.data) {
        dt.entry_date_time = dt.entry_date_time ? DateTime.fromISO(dt.entry_date_time).toFormat('dd-MM-yyyy HH:mm:ss') : '';
      }
      Excel.export(
        'Cabs Lead',
        [
          { header: 'Ref. No.', property: 'reference_no' },
          { header: 'Status', property: 'lead_status' },
          { header: 'Supplier Name', property: 'supplier_name' },
          { header: 'Agent Name', property: 'agent_name' },
          { header: 'Date', property: 'entry_date_time' },
          { header: 'Trip Type', property: 'trip_type' },
          { header: 'Lead Name', property: 'lead_pax_name' },
          { header: 'Lead Email', property: 'lead_pax_email' },
          { header: 'Lead Number', property: 'lead_pax_contact' },
        ],
        data.data, "Cabs Lead", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 19 } }]);
    });
  }
}
