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
import { Security, messages, module_name } from 'app/security';
import { BusService } from 'app/services/bus.service';
import { ToasterService } from 'app/services/toaster.service';
import { Excel } from 'app/utils/export/excel';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { Linq } from 'app/utils/linq';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MarkuppriceInfoComponent } from '../flight/flight/markupprice-info/markupprice-info.component';
import { BusFilterComponent } from './bus-filter/bus-filter.component';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { StatusUpdateComponent } from '../flight/flight/status-update/status-update.component';


@Component({
  selector: 'app-bus',
  templateUrl: './bus.component.html',
  styleUrls: ['./bus.component.scss'],
  styles: [`
    .tbl-grid {
      grid-template-columns:  40px 250px 170px 180px 110px 210px 220px 100px 100px 140px 130px 180px 180px 60px 120px 130px;
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
    MatTabsModule,
  ],

})
export class BusComponent extends BaseListingComponent {

  module_name = module_name.bus
  dataList = [];
  total = 0;
  busFilter: any;

  columns = [
    {
      key: 'booking_ref_no', name: 'Reference No.', is_fixed: true, is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false, toBooking: true
    },
    {
      key: 'status', name: 'Status', is_fixed2: true, is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: true, toColor: true
    },
    {
      key: 'bookingDate', name: 'Date', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
    },
    {
      key: 'tin', name: 'TIN', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false, copyClick: true
    },
    {
      key: 'ticket_no', name: 'Ticket No.', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: true, copyClick: true
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
      key: 'supplier', name: 'Supplier', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
    },
    {
      key: 'purchase_price', name: 'Purchase Price', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
    },
    {
      key: 'sourceCity', name: 'From', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
    },
    {
      key: 'destination', name: 'To', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
    },
    {
      key: 'pax', name: 'Pax', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
    },
    {
      key: 'payment_gateway', name: 'PG', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
    },
    {
      key: 'ip_address', name: 'IP Address', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
    },
  ]
  cols = [];

  constructor(
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private toasterService: ToasterService,
    private router: Router,
    private busService: BusService,
    private clipboard: Clipboard,

  ) {
    super(module_name.bus);
    this.cols = this.columns.map((x) => x.key);
    this.key = this.module_name;
    this.sortColumn = 'bookingDate';
    this.sortDirection = 'desc';
    this.Mainmodule = this;

    this.busFilter = {
      From: '',
      To: '',
      agent_id: '',
      supplierId: '',
      Status: 'All',
      FromDate: new Date(),
      ToDate: new Date(),
    };

    this.busFilter.FromDate.setDate(1);
    this.busFilter.FromDate.setMonth(this.busFilter.FromDate.getMonth());
  }

  copy(link) {
    this.clipboard.copy(link);
    this.toasterService.showToast('success', 'Copied');
  }

  getFilter(): any {
    const filterReq = GridUtils.GetFilterReq(
      this._paginator,
      this._sort,
      this.searchInputControl.value
    );
    filterReq['FromDate'] = DateTime.fromJSDate(this.busFilter.FromDate).toFormat('yyyy-MM-dd');
    filterReq['ToDate'] = DateTime.fromJSDate(this.busFilter.ToDate).toFormat('yyyy-MM-dd');
    filterReq['agent_id'] = this.busFilter?.agent_id?.id || '';
    filterReq['From'] = this.busFilter?.From?.id || '';
    filterReq['To'] = this.busFilter?.To?.id || '';
    filterReq['supplierId'] = this.busFilter?.supplierId?.id || '';
    filterReq['Status'] = this.busFilter?.Status == 'All' ? '' : this.busFilter?.Status;
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
    // let queryParams: any= this.router.navigate([Routes.booking.booking_details_route + '/' + record.id + '/readonly'])
    Linq.recirect('/booking/bus/details/' + record.id);
  }

  refreshItems() {
    this.isLoading = true;
    this.busService.getBusBookingList(this.getFilter()).subscribe({
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
    // const filterReq = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value);
    // const req = Object.assign(filterReq);

    // req.skip = 0;
    // req.take = this._paginator.length;
    const request = {};
    request['FromDate'] = DateTime.fromJSDate(this.busFilter.FromDate).toFormat('yyyy-MM-dd');
    request['ToDate'] = DateTime.fromJSDate(this.busFilter.ToDate).toFormat('yyyy-MM-dd');
    request['agent_id'] = this.busFilter?.agent_id?.id || '';
    request['From'] = this.busFilter?.From?.id || '';
    request['To'] = this.busFilter?.To?.id || '';
    request['supplierId'] = this.busFilter?.supplierId?.id || '';
    request['Status'] = this.busFilter?.Status == 'All' ? '' : this.busFilter?.Status;
    request['Skip'] = 0;
    request['Filter'] = this.searchInputControl.value;
    request['Take'] = this._paginator.length;
    request['OrderBy'] = 'booking_ref_no';
    request['OrderDirection'] = 1;

    this.busService.getBusBookingList(request).subscribe(data => {
      for (var dt of data.data) {
        dt.bookingDate = DateTime.fromISO(dt.bookingDate).toFormat('dd-MM-yyyy HH:mm:ss')
        dt.departuteDate = DateTime.fromISO(dt.departuteDate).toFormat('dd-MM-yyyy HH:mm:ss')
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
        data.data, "Bus Booking", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]);
    });
  }

}


