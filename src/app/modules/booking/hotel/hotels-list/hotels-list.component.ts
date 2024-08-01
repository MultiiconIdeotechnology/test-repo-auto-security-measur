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
import { Security, bookingsHotelPermissions, messages, module_name } from 'app/security';
import { HotelBookingService } from 'app/services/hotel-booking.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { Linq } from 'app/utils/linq';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MarkuppriceInfoComponent } from '../../flight/flight/markupprice-info/markupprice-info.component';
import { Excel } from 'app/utils/export/excel';
import { HotelFilterComponent } from '../hotel-filter/hotel-filter.component';

@Component({
  selector: 'app-hotels-list',
  templateUrl: './hotels-list.component.html',
  styleUrls: ['./hotels-list.component.scss'],
  styles: [`
  .tbl-grid {
    grid-template-columns:  40px 250px 170px 175px 190px 130px 100px 170px 130px 200px 220px 240px 120px 120px 100px 100px 100px 180px 150px 150px;
  }
`],
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
    MatTabsModule
  ],
})
export class HotelsListComponent extends BaseListingComponent {

  module_name = module_name.hotel
  dataList = [];
  total = 0;
  hotelFilter: any;

  columns = [
    { key: 'booking_ref_no', name: 'Reference No.',is_fixed: true, is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: true, toBooking: true },
    {
      key: 'status', name: 'Status', is_date: false,is_fixed2: true, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: true, toColor: true
    },
    {
      key: 'bookingDate', name: 'Date', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
    },
    {
      key: 'agent_name', name: 'Agent', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: true
    },
    {
      key: 'user_type', name: 'Type', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
    },
    {
      key: 'mop', name: 'MOP', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
    },
    {
      key: 'supplier_name', name: 'Supplier', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: true
    },
    {
      key: 'purchase_price', name: 'Purchase Price', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: true
    },
    {
      key: 'from_city', name: 'Destination', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: true
    },
    {
      key: 'pax', name: 'Pax', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
    },
    {
      key: 'hotel_name', name: 'Hotel', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: true
    },
    {
      key: 'check_in_date', name: 'Check In', is_date: true, date_formate: 'dd-MM-yyyy', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
    },
    {
      key: 'check_out_date', name: 'Check Out', is_date: true, date_formate: 'dd-MM-yyyy', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
    },
    {
      key: 'no_of_rooms', name: 'Rooms', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false,
    },
    {
      key: 'no_of_nights', name: 'Nights', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false,
    },
    {
      key: 'device', name: 'Device', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false, toview: false
    },
    {
      key: 'supplier_ref_no', name: 'Supplier Ref. No.', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: true, toview: false
    },
    {
      key: 'payment_gateway_name', name: 'PG', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false, toview: false
    },
    {
      key: 'ip_address', name: 'IP Address', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false, toview: false
    },
  ]
  cols = [];

  constructor(
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private toasterService: ToasterService,
    private router: Router,
    private hotelBookingService: HotelBookingService
  ) {
    super(module_name.bus);
    this.cols = this.columns.map((x) => x.key);
    this.key = this.module_name;
    this.sortColumn = 'bookingDate';
    this.sortDirection = 'desc';
    this.Mainmodule = this;

    this.hotelFilter = {
      Status: 'All',
      From: '',
      agent_id: '',
      FromDate: new Date(),
      ToDate: new Date(),
    };

    this.hotelFilter.FromDate.setDate(1);
    this.hotelFilter.FromDate.setMonth(this.hotelFilter.FromDate.getMonth());
  }

  getFilter(): any {
    const filterReq = GridUtils.GetFilterReq(
      this._paginator,
      this._sort,
      this.searchInputControl.value
    );
    filterReq['FromDate'] = DateTime.fromJSDate(this.hotelFilter.FromDate).toFormat('yyyy-MM-dd');
    filterReq['ToDate'] = DateTime.fromJSDate(this.hotelFilter.ToDate).toFormat('yyyy-MM-dd');
    filterReq['agent_id'] = this.hotelFilter?.agent_id?.id || '';
    // filterReq['From'] = this.hotelFilter?.From?.id || '';
    filterReq['From'] ='';
    filterReq['Status'] = this.hotelFilter?.Status == 'All' ? '' : this.hotelFilter?.Status;
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

  viewData(record): void {
    if (!Security.hasPermission(bookingsHotelPermissions.modifyPermissions)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    Linq.recirect('/booking/hotel/details/' + record.id);
  }

  refreshItems() {
    this.isLoading = true;
    this.hotelBookingService.getHotelBookingList(this.getFilter()).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.dataList = data.data;
        this._paginator.length = data.total;
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

    // const filterReq = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value);
    // const req = Object.assign(filterReq);

    // req.skip = 0;
    // req.take = this._paginator.length;
    const filterReq = {};

    filterReq['FromDate'] = DateTime.fromJSDate(this.hotelFilter.FromDate).toFormat('yyyy-MM-dd');
    filterReq['ToDate'] = DateTime.fromJSDate(this.hotelFilter.ToDate).toFormat('yyyy-MM-dd');
    filterReq['agent_id'] = this.hotelFilter?.agent_id?.id || '';
    filterReq['From'] = this.hotelFilter?.From?.id || '';
    filterReq['Status'] = this.hotelFilter?.Status == 'All' ? '' : this.hotelFilter?.Status;
    filterReq['Skip'] = 0;
    filterReq['Filter'] = this.searchInputControl.value;
    filterReq['Take'] = this._paginator.length;
    filterReq['OrderBy'] = 'booking_ref_no';
    filterReq['OrderDirection'] = 1;

    this.hotelBookingService.getHotelBookingList(filterReq).subscribe(data => {
      for (var dt of data.data) {
        dt.bookingDate = DateTime.fromISO(dt.bookingDate).toFormat('dd-MM-yyyy HH:mm:ss')
        dt.check_in_date = DateTime.fromISO(dt.check_in_date).toFormat('dd-MM-yyyy')
        dt.check_out_date = DateTime.fromISO(dt.check_out_date).toFormat('dd-MM-yyyy')
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
        data.data, "Hotel Booking", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }]);
    });
  }

}
