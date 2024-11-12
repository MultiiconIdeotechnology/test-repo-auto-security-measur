import { NgIf, NgFor, DatePipe, CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
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
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterOutlet } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, filter_module_name, messages, module_name } from 'app/security';
import { BusService } from 'app/services/bus.service';
import { ToasterService } from 'app/services/toaster.service';
import { Excel } from 'app/utils/export/excel';
import { Linq } from 'app/utils/linq';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MarkuppriceInfoComponent } from '../flight/flight/markupprice-info/markupprice-info.component';
import { BusFilterComponent } from './bus-filter/bus-filter.component';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentService } from 'app/services/agent.service';
import { FlightTabService } from 'app/services/flight-tab.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';


@Component({
  selector: 'app-bus',
  templateUrl: './bus.component.html',
  styleUrls: ['./bus.component.scss'],
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
    PrimeNgImportsModule
  ],

})
export class BusComponent extends BaseListingComponent {

  module_name = module_name.bus;
  filter_table_name = filter_module_name.bus_booking;
  private settingsUpdatedSubscription: Subscription;
  dataList = [];
  total = 0;
  busFilter: any;
  statusList = ['Payment Failed', 'Waiting for Payment', 'Booking Failed', 'Confirmation Pending', 'Transaction Failed', 'Pending', 'Failed', 'Confirmed', 'Cancelled'];
  isFilterShow: boolean = false;
  agentList: any[] = [];
  selectedAgent: any;
  selectedFromCity: any;
  selectedToCity: any;
  selectedSupplier: any;
  fromcityList: any[] = [];
  tocityList: any[] = [];
  supplierListAll: any[] = [];
  isfirst: boolean = true;
  cols = [];

  constructor(
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private toasterService: ToasterService,
    private router: Router,
    private busService: BusService,
    private agentService: AgentService,
    private flighttabService: FlightTabService,
    private clipboard: Clipboard,
    public _filterService: CommonFilterService
  ) {
    super(module_name.bus);
    this.key = this.module_name;
    this.sortColumn = 'bookingDate';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);

    this.busFilter = {
      From: '',
      To: '',
      agent_id: '',
      supplierId: [{
        "id": "all",
        "company_name": "All"
      }],
      Status: ['All'],
      FromDate: new Date(),
      ToDate: new Date(),
    };

    this.busFilter.FromDate.setDate(1);
    this.busFilter.FromDate.setMonth(this.busFilter.FromDate.getMonth() - 3);
  }

  ngOnInit(): void {
    this.agentList = this._filterService.agentListById;
    this.getSupplier();
    this.getFromCity('');
    this.getToCity('');

    // common filter
    this._filterService.selectionDateDropdown = "";
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
      this._filterService.selectionDateDropdown = "";
      this.selectedAgent = resp['table_config']['agent_id_filters']?.value;
      this.selectedSupplier = resp['table_config']['supplier']?.value;
      this.selectedFromCity = resp['table_config']['from_id_filters']?.value;
      this.selectedToCity = resp['table_config']['to_id_filters']?.value;

      if (this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }

      if (this.selectedFromCity && this.selectedFromCity.id) {
        const match = this.fromcityList.find((item: any) => item.id == this.selectedFromCity?.id);
        if (!match) {
          this.fromcityList.push(this.selectedFromCity);
        }
      }

      if (this.selectedToCity && this.selectedToCity.id) {
        const match = this.tocityList.find((item: any) => item.id == this.selectedToCity?.id);
        if (!match) {
          this.tocityList.push(this.selectedToCity);
        }
      }

      // this.sortColumn = resp['sortColumn'];
      // this.primengTable['_sortField'] = resp['sortColumn'];
      if (resp['table_config']['bookingDate']?.value != null && resp['table_config']['bookingDate'].value.length) {
        this._filterService.selectionDateDropdown = 'Custom Date Range';
        this._filterService.rangeDateConvert(resp['table_config']['bookingDate']);
      }
      this.primengTable['filters'] = resp['table_config'];
      this.isFilterShow = true;
      this.primengTable._filter();
    });
  }

  ngAfterViewInit() {
    // Defult Active filter show
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      this.isFilterShow = true;
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      this.selectedAgent = filterData['table_config']['agent_id_filters']?.value;
      this.selectedSupplier = filterData['table_config']['supplier']?.value;
      this.selectedFromCity = filterData['table_config']['from_id_filters']?.value;
      this.selectedToCity = filterData['table_config']['to_id_filters']?.value;
      if (this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }

      if (filterData['table_config']['bookingDate']?.value != null && filterData['table_config']['bookingDate'].value.length) {
        this._filterService.selectionDateDropdown = 'Custom Date Range';
        this._filterService.rangeDateConvert(filterData['table_config']['bookingDate']);
      }
      // this.primengTable['_sortField'] = filterData['sortColumn'];
      // this.sortColumn = filterData['sortColumn'];
      this.primengTable['filters'] = filterData['table_config'];
    }
  }

  copy(link:any) {
    this.clipboard.copy(link);
    this.toasterService.showToast('success', 'Copied');
  }

  getAgent(value: string) {
    this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
      this.agentList = data;

      for (let i in this.agentList) {
        this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`
      }
    });
  }

  getFromCity(value: string) {
    this.busService.getBusCityCombo(value).subscribe((data) => {
      this.fromcityList = data;

      if (this.selectedFromCity && this.selectedFromCity.id) {
        const match = this.fromcityList.find((item: any) => item.id == this.selectedFromCity?.id);
        if (!match) {
          this.fromcityList.push(this.selectedFromCity);
        }
      }

    });
  }

  getToCity(value: string) {
    this.busService.getBusCityCombo(value).subscribe((data) => {
      this.tocityList = data;

      if (this.selectedToCity && this.selectedToCity.id) {
        const match = this.tocityList.find((item: any) => item.id == this.selectedToCity?.id);
        if (!match) {
          this.tocityList.push(this.selectedToCity);
        }
      }
    });
  }

  getSupplier() {
    this.flighttabService.getSupplierBoCombo('Bus').subscribe((data) => {
      this.supplierListAll = data;

      for (let i in this.supplierListAll) {
        this.supplierListAll[i].id_by_value = this.supplierListAll[i].company_name;
      }
    })
  }


  getFilter(): any {
    const filterReq = {};
    filterReq['FromDate'] = '';
    filterReq['ToDate'] = '';
    // filterReq['FromDate'] = DateTime.fromJSDate(this.busFilter.FromDate).toFormat('yyyy-MM-dd');
    // filterReq['ToDate'] = DateTime.fromJSDate(this.busFilter.ToDate).toFormat('yyyy-MM-dd');
    filterReq['agent_id'] = this.busFilter?.agent_id?.id || '';
    filterReq['From'] = this.busFilter?.From?.id || '';
    filterReq['To'] = this.busFilter?.To?.id || '';
    // filterReq['supplierId'] = this.busFilter?.supplierId?.id || '';
    // filterReq['Status'] = this.busFilter?.Status == 'All' ? '' : this.busFilter?.Status;
    filterReq['supplierId'] = this.busFilter?.supplierId?.map(x => x.id).join(',') == 'all' ? '' : this.busFilter?.supplierId?.map(x => x.id).join(',');
    filterReq['Status'] = this.busFilter?.Status == 'All' ? '' : this.busFilter?.Status.join(',');

    return filterReq;
  }

  filter() {
    this.matDialog
      .open(BusFilterComponent, {
        data: this.busFilter,
        disableClose: true,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.busFilter = res;
          this.refreshItems();
        }
      });
  }

  viewField(data: any): void {
    if (data.price_Detail.length == null) {
      return;
    } else {
      this.matDialog
        .open(MarkuppriceInfoComponent, {
          disableClose: true,
          data: { data: data.price_Detail, title: "Price Details" },
        })
        .afterClosed()
        .subscribe({
          next: (value) => { },
        });
    }
  }


  viewInternal(record): void {
    if (!Security.hasViewDetailPermission(module_name.bus)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    // let queryParams: any= this.router.navigate([Routes.booking.booking_details_route + '/' + record.id + '/readonly'])
    Linq.recirect('/booking/bus/details/' + record.id);
  }

  refreshItems(event?: any) {
    this.isLoading = true;
    let extraModel = this.getFilter();
    let newModel = this.getNewFilterReq(event)
    var model = { ...extraModel, ...newModel };
    this.busService.getBusBookingList(model).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.dataList = data.data;
        this.totalRecords = data.total;
        // this._paginator.length = data.total;
        if (this.dataList && this.dataList.length) {
          setTimeout(() => {
            this.isFrozenColumn('', ['booking_ref_no', 'status']);
          }, 200);
        } else {
          setTimeout(() => {
            this.isFrozenColumn('', ['booking_ref_no', 'status'], true);
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
    if (status == 'Pending' || status == 'Offline Pending' || status == 'Confirmation Pending') {
      return 'text-orange-600';
    } else if (status == 'Waiting for Payment' || status == 'Partial Payment Completed') {
      return 'text-yellow-600';
    } else if (status == 'Confirmed') {
      return 'text-green-600';
    } else if (status == 'Payment Failed' || status == 'Booking Failed' || status == 'Cancelled') {
      return 'text-red-600';
    } else if (status == 'Hold') {
      return 'text-blue-600';
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

    let extraModel = this.getFilter();
    let newModel = this.getNewFilterReq({})
    const request = { ...extraModel, ...newModel };
    request['FromDate'] = DateTime.fromJSDate(this.busFilter.FromDate).toFormat('yyyy-MM-dd');
    request['ToDate'] = DateTime.fromJSDate(this.busFilter.ToDate).toFormat('yyyy-MM-dd');
    request['agent_id'] = this.busFilter?.agent_id?.id || '';
    request['From'] = this.busFilter?.From?.id || '';
    request['To'] = this.busFilter?.To?.id || '';
    request['supplierId'] = this.busFilter?.supplierId?.map(x => x.id).join(',') == 'all' ? '' : this.busFilter?.supplierId?.map(x => x.id).join(',');
    request['Status'] = this.busFilter?.Status == 'All' ? '' : this.busFilter?.Status.join(',');
    request['Take'] = this.totalRecords;

    this.busService.getBusBookingList(request).subscribe(data => {
      for (var dt of data.data) {
        dt.bookingDate = dt.bookingDate ? DateTime.fromISO(dt.bookingDate).toFormat('dd-MM-yyyy HH:mm:ss') : '';
        dt.departuteDate = dt.departuteDate ? DateTime.fromISO(dt.departuteDate).toFormat('dd-MM-yyyy HH:mm:ss') : '';
      }

      Excel.export(
        'Bus Booking',
        [
          { header: 'Reference No.', property: 'booking_ref_no' },
          { header: 'Status', property: 'status' },
          { header: 'Date', property: 'bookingDate' },
          { header: 'TIN', property: 'tin' },
          { header: 'Ticket No', property: 'ticket_no' },
          { header: 'Agency', property: 'agent_name' },
          { header: 'Type', property: 'user_type' },
          { header: 'MOP', property: 'mop' },
          { header: 'Supplier', property: 'supplier' },
          { header: 'Purchase Price', property: 'purchase_price' },
          { header: 'From', property: 'sourceCity' },
          { header: 'To', property: 'destination' },
          { header: 'Pax', property: 'pax' },
          { header: 'PG', property: 'payment_gateway' },
          { header: 'IP Address', property: 'ip_address' },
        ],
        data.data, "Bus Booking", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }]);
    });
  }

  ngOnDestroy(): void {

    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }

}


