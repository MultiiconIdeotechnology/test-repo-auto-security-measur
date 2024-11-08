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
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterOutlet } from '@angular/router';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { ForexService } from 'app/services/forex.service';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { filter_module_name, forexPermissions, messages, module_name, Security } from 'app/security';
import { AgentService } from 'app/services/agent.service';
import { BusService } from 'app/services/bus.service';
import { ToasterService } from 'app/services/toaster.service';
import { Subscription } from 'rxjs';
import { ForexBookingDetailsComponent } from '../forex-booking-details/forex-booking-details.component';
import { EntityService } from 'app/services/entity.service';
import { RejectReasonComponent } from 'app/modules/masters/agent/reject-reason/reject-reason.component';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-forex-list',
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
    MatTabsModule,
    PrimeNgImportsModule,
    ForexBookingDetailsComponent,
  ],
  templateUrl: './forex-list.component.html',
  styleUrls: ['./forex-list.component.scss']
})
export class ForexListComponent extends BaseListingComponent {

  module_name = module_name.forex;
  filter_table_name = filter_module_name.forex_booking;
  private settingsUpdatedSubscription: Subscription;
  dataList = [];
  total = 0;
  hotelFilter: any;
  agentList: any[];
  selectedAgent: any;
  _selectedColumns: any;
  isFilterShow: boolean;
  cols: any;
  statusList = [
    { label: 'New', value: 'New' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  rateList = ['BUY', 'SELL'];

  // readList = ['Read', 'Unread'];
  readList: any[] = [
    { label: 'Read', value: true },
    { label: 'Unread', value: false },
  ]

  transactionList = ['Forex Card', 'Currency Note'];
  cityList: any[] = [];
  supplierList: any[] = [];
  fromcurrencyListAll: any[] = [];
  tocurrencyListAll: any[] = [];

  constructor(
    private agentService: AgentService,
    private forexService: ForexService,
    private matDialog: MatDialog,
    private toasterService: ToasterService,
    public _filterService: CommonFilterService,
    private conformationService: FuseConfirmationService,
    private entityService: EntityService,
  ) {
    super(module_name.forex);
    this.key = this.module_name;
    this.sortColumn = 'entry_date_time';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);

    this.hotelFilter = {
      supplierId: [{
        "id": "all",
        "company_name": "All"
      }],
      Status: ['All'],
      From: '',
      agent_id: '',
      FromDate: new Date(),
      ToDate: new Date(),
    };

    this.hotelFilter.FromDate.setDate(1);
    this.hotelFilter.FromDate.setMonth(this.hotelFilter.FromDate.getMonth() - 3);


  }

  ngOnInit() {
    this.getCitytList('');
    this.getSupplierList('');
    this.getCurrencyList();
    this.agentList = this._filterService.agentListById;

    // common filter
    this._filterService.selectionDateDropdown = "";
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
      this._filterService.selectionDateDropdown = "";
      this.selectedAgent = resp['table_config']['agent_id_filters']?.value;
      if (this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }

      if (resp['table_config']['entry_date_time']?.value != null && resp['table_config']['entry_date_time'].value.length) {
        this._filterService.selectionDateDropdown = 'Custom Date Range';
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
        this._filterService.selectionDateDropdown = 'Custom Date Range';
        this._filterService.rangeDateConvert(filterData['table_config']['entry_date_time']);
      }

      this.primengTable['filters'] = filterData['table_config'];
      this._selectedColumns = filterData['selectedColumns'] || [];
      this.isFilterShow = true;
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

  // Currency List api
  getCurrencyList() {
    this.forexService.getcurrencyCombo().subscribe((data) => {
      this.fromcurrencyListAll = data;
      this.tocurrencyListAll = data;

      for (let i in this.fromcurrencyListAll) {
        this.fromcurrencyListAll[i].id_by_value = this.fromcurrencyListAll[i].currency_short_code;
      }

      for (let i in this.tocurrencyListAll) {
        this.tocurrencyListAll[i].id_by_value = this.tocurrencyListAll[i].currency_short_code;
      }
    })
  }

  // Api to get the City list data
  getCitytList(value: string, bool = true) {
    this.forexService.getCityCombo(value).subscribe((data: any) => {
      this.cityList = data;
    });
  } 
  
  // Api to get the Supplier list data
  getSupplierList(value: string, bool = true) {
    this.forexService.getSupplierForexCombo(value).subscribe((data: any) => {
      this.supplierList = data;
    });
  }

  viewData(record) {
    // if (!Security.hasViewDetailPermission(module_name.forex)) {
    //   return this.alertService.showToast('error', messages.permissionDenied);
    // }
    this.entityService.raiseForexEntityCall({ data: record })
  }

  ngOnDestroy(): void {

    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }

  Rejected(record: any, code: any): void {
    if (!Security.hasPermission(forexPermissions.rejectedPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(RejectReasonComponent, {
      disableClose: true,
      data: record,
      panelClass: 'full-dialog'
    }).afterClosed().subscribe({
      next: (res) => {
        if (res) {
          const Fdata = {}
          Fdata['id'] = record.id,
            Fdata['status_code'] = code,
            Fdata['note'] = res,
            this.forexService.setLeadStatus(Fdata).subscribe({
              next: () => {
                this.alertService.showToast('success', "Forex Reject", "top-right", true);
                this.refreshItems()
              },
              error: (err) => this.alertService.showToast('error', err, "top-right", true)
            })
        }
      }
    })
  }

  status(record: any, code: any): void {
    if (!Security.hasPermission(forexPermissions.statusPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const label: string = code == 1 ? 'Forex Confirm' : 'Forex Cancel';
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ?'
    }).afterClosed().subscribe({
      next: (res) => {
        if (res === 'confirmed') {
          const Fdata = {}
          Fdata['id'] = record.id,
            Fdata['status_code'] = code,
            Fdata['note'] = '',
            this.forexService.setLeadStatus(Fdata).subscribe({
              next: () => {
                this.alertService.showToast('success', code == 1 ? 'Forex Confirm' : 'Forex Cancel', "top-right", true);
                this.refreshItems();
              }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
            });
        }
      }
    })
  }

  getFilter(): any {
    let filterReq = {};
    filterReq['fromdate'] = '';
    filterReq['todate'] = '';
    filterReq['ratefor'] = '';
    filterReq['type'] = '';
    filterReq['status'] = '';

    return filterReq;
  }

  refreshItems(event?: any) {
    this.isLoading = true;
    let extraModel = this.getFilter();
    let newModel = this.getNewFilterReq(event)
    var model = { ...extraModel, ...newModel };
    this.forexService.getLeadList(model).subscribe({
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
    if (status == 'New') {
      return 'text-orange-600';
    } else if (status == 'Confirmed') {
      return 'text-green-600';
    } else if (status == 'Cancelled' || status == 'Rejected') {
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

  get selectedColumns(): Column[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: Column[]) {
    if (Array.isArray(val)) {
      this._selectedColumns = this.cols.filter(col =>
        val.some(selectedCol => selectedCol.field === col.field)
      );
    } else {
      this._selectedColumns = [];
    }
  }

  exportExcel(): void {
    if (!Security.hasExportDataPermission(module_name.bookingsHotel)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    let extraModel = this.getFilter();
    let newModel = this.getNewFilterReq({})
    const filterReq = { ...extraModel, ...newModel };
    filterReq['Take'] = this.totalRecords;

    this.forexService.getLeadList(filterReq).subscribe(data => {
      for (var dt of data.data) {
        dt.entry_date_time = dt.entry_date_time ? DateTime.fromISO(dt.entry_date_time).toFormat('dd-MM-yyyy HH:mm:ss') : '';
      }
      Excel.export(
        'Forex',
        [
          { header: 'Ref. No.', property: 'reference_no' },
          { header: 'Status', property: 'lead_status' },
          { header: 'Supplier', property: 'supplier_name' },
          { header: 'Agent', property: 'agent' },
          { header: 'Rate For', property: 'rate_for' },
          { header: 'City', property: 'city_name' },
          { header: 'From Currency', property: 'from_currency' },
          { header: 'To Currency', property: 'to_currency' },
          { header: 'Transaction Type', property: 'transaction_type' },
          { header: 'B2C Customer', property: 'customer_name' },
          { header: 'Lead Name', property: 'lead_name' },
          { header: 'Lead Email', property: 'lead_email' },
          { header: 'Lead Number', property: 'lead_mobile' },
          { header: 'Date', property: 'entry_date_time' },
        ],
        data.data, "Forex", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 19 } }]);
    });
  }

}
