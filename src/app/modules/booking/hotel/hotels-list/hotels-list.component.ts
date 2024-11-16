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
import { Security, bookingsHotelPermissions, filter_module_name, messages, module_name } from 'app/security';
import { HotelBookingService } from 'app/services/hotel-booking.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { Linq } from 'app/utils/linq';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MarkuppriceInfoComponent } from '../../flight/flight/markupprice-info/markupprice-info.component';
import { Excel } from 'app/utils/export/excel';
import { HotelFilterComponent } from '../hotel-filter/hotel-filter.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentService } from 'app/services/agent.service';
import { BusService } from 'app/services/bus.service';
import { FlightTabService } from 'app/services/flight-tab.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
  selector: 'app-hotels-list',
  templateUrl: './hotels-list.component.html',
  styleUrls: ['./hotels-list.component.scss'],
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
export class HotelsListComponent extends BaseListingComponent {

  module_name = module_name.hotel;
  filter_table_name = filter_module_name.hotel_booking;
  private settingsUpdatedSubscription: Subscription;
  dataList = [];
  total = 0;
  hotelFilter: any;
  selectedAgent!: any;
  selectedSupplier!: any;
  agentList: any[] = [];
  supplierListAll: any[] = [];
  statusList = ['Confirmation Pending', 'Pending', 'Failed', 'Confirmed', 'Cancellation Pending', 'Payment Failed', 'Rejected', 'Cancelled'];
  cols = [];
  isFilterShow: boolean = false;

  constructor(
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private agentService: AgentService,
    private busService: BusService,
    private flighttabService: FlightTabService,
    private toasterService: ToasterService,
    private router: Router,
    private hotelBookingService: HotelBookingService,
    public _filterService: CommonFilterService
  ) {
    super(module_name.bus);
    this.key = this.module_name;
    this.sortColumn = 'bookingDate';
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

  ngOnInit(): void {
    this.agentList = this._filterService.agentListById;
    this.getSupplier();
    // this.getFromCity('');

    // common filter
    this._filterService.selectionDateDropdown = "";
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
      this._filterService.selectionDateDropdown = "";
      console.log("resp", resp)
      this.selectedAgent = resp['table_config']['agent_id_filters']?.value;
      if (this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }

      this.selectedSupplier = resp['table_config']['supplier_name']?.value;
      // this.sortColumn = resp['sortColumn'];
      // this.primengTable['_sortField'] = resp['sortColumn'];
    
      if (resp['table_config']['bookingDate']?.value && Array.isArray(resp['table_config']['bookingDate']?.value)) {
          this._filterService.selectionDateDropdown = 'custom_date_range';
          this._filterService.rangeDateConvert(resp['table_config']['bookingDate']);
      }

      if (resp['table_config']['check_in_date']?.value != null) {
        resp['table_config']['check_in_date'].value = new Date(resp['table_config']['check_in_date'].value);
      }
      if (resp['table_config']['check_out_date']?.value != null) {
        resp['table_config']['check_out_date'].value = new Date(resp['table_config']['check_out_date'].value);
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
      this.selectedSupplier = filterData['table_config']['supplier_name']?.value;
      if (this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }
      console.log("filterdata", filterData['table_config'])
      if (filterData['table_config']['bookingDate']?.value && Array.isArray(filterData['table_config']['bookingDate']?.value)) {
        console.log(">>><<<", filterData['table_config']['bookingDate']?.value)
        this._filterService.selectionDateDropdown = 'custom_date_range';
        this._filterService.rangeDateConvert(filterData['table_config']['bookingDate']);
    }
    
      if (filterData['table_config']['check_in_date']?.value != null) {
        filterData['table_config']['check_in_date'].value = new Date(filterData['table_config']['check_in_date'].value);
      }
      if (filterData['table_config']['check_out_date']?.value != null) {
        filterData['table_config']['check_out_date'].value = new Date(filterData['table_config']['check_out_date'].value);
      }
      // this.primengTable['_sortField'] = filterData['sortColumn'];
      // this.sortColumn = filterData['sortColumn'];
      this.primengTable['filters'] = filterData['table_config'];
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

  // getFromCity(value: string) {
  //   this.busService.getBusCityCombo(value).subscribe((data) => {
  //     this.fromcityList = data;
  //     if (value == "") {
  //       this.tocityList = data;
  //     }
  //   });
  // }

  getSupplier() {
    this.flighttabService.getSupplierBoCombo('Hotel').subscribe((data) => {
      this.supplierListAll = data;

      for (let i in this.supplierListAll) {
        this.supplierListAll[i].id_by_value = this.supplierListAll[i].company_name;
      }
    })
  }

  getFilter(): any {
    let filterReq = {};
    filterReq['FromDate'] = '';
    filterReq['ToDate'] = '';
    // filterReq['FromDate'] = DateTime.fromJSDate(this.hotelFilter.FromDate).toFormat('yyyy-MM-dd');
    // filterReq['ToDate'] = DateTime.fromJSDate(this.hotelFilter.ToDate).toFormat('yyyy-MM-dd');
    filterReq['agent_id'] = this.hotelFilter?.agent_id?.id || '';
    filterReq['From'] = '';
    filterReq['supplierId'] = this.hotelFilter?.supplierId?.map(x => x.id).join(',') == 'all' ? '' : this.hotelFilter?.supplierId?.map(x => x.id).join(',');
    filterReq['Status'] = this.hotelFilter?.Status == 'All' ? '' : this.hotelFilter?.Status.join(',');

    return filterReq;
  }

  filter() {
    this.matDialog
      .open(HotelFilterComponent, {
        data: this.hotelFilter,
        disableClose: true,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.hotelFilter = res;
          this.refreshItems();
        }
      });
  }

  viewField(data: any): void {
    if (data?.fields?.length == null) {
      return;
    } else {
      this.matDialog
        .open(MarkuppriceInfoComponent, {
          disableClose: true,
          data: { data: data.fields, title: "Price Details" },
        })
        .afterClosed()
        .subscribe({
          next: (value) => { },
        });
    }
  }

  getStatusColor(status: string): string {
    if (status == 'Pending' || status == 'Cancellation Pending' || status == 'Confirmation Pending') {
      return 'text-orange-600';
    } else if (status == 'Waiting For Payment' || status == 'Partial Payment Completed') {
      return 'text-yellow-600';
    } else if (status == 'Confirmed') {
      return 'text-green-600';
    } else if (status == 'Payment Failed' || status == 'Booking Failed' || status == 'Cancelled' || status == 'Failed' || status == 'Rejected') {
      return 'text-red-600';
    } else if (status == 'Hold') {
      return 'text-blue-600';
    } else {
      return '';
    }
  }

  viewData(record): void {
    // if (!Security.hasPermission(bookingsHotelPermissions.modifyPermissions)) {
    //   return this.alertService.showToast('error', messages.permissionDenied);
    // }
    if (!Security.hasViewDetailPermission(module_name.bookingsHotel)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    Linq.recirect('/booking/hotel/details/' + record.id);
  }

  refreshItems(event?: any) {
    this.isLoading = true;
    let extraModel = this.getFilter();
    let newModel = this.getNewFilterReq(event)
    var model = { ...extraModel, ...newModel };
    this.hotelBookingService.getHotelBookingList(model).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.dataList = data.data;
        this.totalRecords = data.total;
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

  getNodataText(): string {
    if (this.isLoading) return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  exportExcel(): void {
    if (!Security.hasExportDataPermission(module_name.bookingsHotel)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    let extraModel = this.getFilter();
    let newModel = this.getNewFilterReq({})
    const filterReq = { ...extraModel, ...newModel };
    filterReq['FromDate'] = DateTime.fromJSDate(this.hotelFilter.FromDate).toFormat('yyyy-MM-dd');
    filterReq['ToDate'] = DateTime.fromJSDate(this.hotelFilter.ToDate).toFormat('yyyy-MM-dd');
    filterReq['agent_id'] = this.hotelFilter?.agent_id?.id || '';
    filterReq['From'] = this.hotelFilter?.From?.id || '';
    filterReq['supplierId'] = this.hotelFilter?.supplierId?.map(x => x.id).join(',') == 'all' ? '' : this.hotelFilter?.supplierId?.map(x => x.id).join(',');
    filterReq['Status'] = this.hotelFilter?.Status == 'All' ? '' : this.hotelFilter?.Status.join(',');
    filterReq['Take'] = this.totalRecords;

    this.hotelBookingService.getHotelBookingList(filterReq).subscribe(data => {
      for (var dt of data.data) {
        dt.bookingDate = dt.bookingDate ? DateTime.fromISO(dt.bookingDate).toFormat('dd-MM-yyyy HH:mm:ss') : '';
        dt.check_in_date = dt.check_in_date ? DateTime.fromISO(dt.check_in_date).toFormat('dd-MM-yyyy') : '';
        dt.check_out_date = dt.check_out_date ? DateTime.fromISO(dt.check_out_date).toFormat('dd-MM-yyyy') : '';
      }
      Excel.export(
        'Hotel Booking',
        [
          { header: 'Reference No.', property: 'booking_ref_no' },
          { header: 'Status', property: 'status' },
          { header: 'Date', property: 'bookingDate' },
          { header: 'Agent', property: 'agent_name' },
          { header: 'Type', property: 'user_type' },
          { header: 'MOP', property: 'mop' },
          { header: 'Supplier', property: 'supplier_name' },
          { header: 'Purchase Price', property: 'purchase_price' },
          { header: 'Destination', property: 'from_city' },
          { header: 'Pax', property: 'pax' },
          { header: 'Hotel', property: 'hotel_name' },
          { header: 'Check In', property: 'check_in_date' },
          { header: 'Check Out', property: 'check_out_date' },
          { header: 'Rooms', property: 'no_of_rooms' },
          { header: 'Nights', property: 'no_of_nights' },
          { header: 'Device', property: 'device' },
          { header: 'Supplier Ref. No.', property: 'supplier_ref_no' },
          { header: 'PG', property: 'payment_gateway_name' },
          { header: 'IP Address', property: 'ip_address' },
        ],
        data.data, "Hotel Booking", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 19 } }]);
    });
  }

  ngOnDestroy(): void {

    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }

}
