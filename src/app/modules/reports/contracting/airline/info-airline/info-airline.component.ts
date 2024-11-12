import { Component, Inject, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterOutlet } from '@angular/router';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { module_name } from 'app/security';
import { FlightTabService } from 'app/services/flight-tab.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { DateTime } from 'luxon';
import { AppConfig } from 'app/config/app-config';
import { BaseListingComponent } from 'app/form-models/base-listing';

@Component({
  selector: 'app-info-airline',
  standalone: true,
  styles: [`
    .tbl-grid {
      grid-template-columns:  240px 170px 180px 130px 130px 150px 140px 120px 100px 170px 100px 100px 100px 150px 150px 130px 140px;
    }
    `],
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
  templateUrl: './info-airline.component.html',
  styleUrls: ['./info-airline.component.scss']
})
export class InfoAirlineComponent extends BaseListingComponent{

  flightFilter: any;
  // module_name = module_name.flight;
  dataList = [];
  total = 0;
  appConfig = AppConfig;
  isLoading: any;
  searchInputControl = new FormControl('');
  @ViewChild(MatPaginator) public _paginator: MatPaginator;
  @ViewChild(MatSort) public _sort: MatSort;
  module_name = module_name.info_airline



  columns = [
    {
      key: 'booking_ref_no',
      name: 'Reference No.',
      is_date: false,
      is_fixed: true,
      date_formate: '',
      is_sortable: true,
      class: '',
      is_sticky: false,
      align: '',
      indicator: false,
      applied: false,
      toBooking: true,
      tooltip: false
    },
    {
      key: 'bookingDate',
      name: 'Date',
      is_date: true,
      date_formate: 'dd-MM-yyyy HH:mm:ss',
      is_sortable: true,
      class: '',
      is_sticky: false,
      align: 'left',
      indicator: false,
      applied: false,
      tooltip: false
    },
    {
      key: 'agent_name',
      name: 'Agent',
      is_date: false,
      date_formate: '',
      is_sortable: true,
      class: '',
      is_sticky: false,
      align: 'left',
      indicator: true,
      applied: false,
      tooltip: true
    },

    {
      key: 'pnr',
      name: 'PNR',
      is_date: false,
      date_formate: '',
      is_sortable: true,
      class: '',
      is_sticky: false,
      align: 'left',
      indicator: true,
      applied: false,
      tooltip: false
    },
    {
      key: 'gds_pnr',
      name: 'GDS PNR',
      is_date: false,
      date_formate: '',
      is_sortable: true,
      class: '',
      is_sticky: false,
      align: 'left',
      indicator: true,
      applied: false,
      tooltip: false
    },
    {
      key: 'user_type',
      name: 'Type',
      is_date: false,
      date_formate: '',
      is_sortable: true,
      class: '',
      is_sticky: false,
      align: 'left',
      indicator: false,
      applied: false,
      tooltip: false
    },
    {
      key: 'mop',
      name: 'MOP',
      is_date: false,
      date_formate: '',
      is_sortable: true,
      class: '',
      is_sticky: false,
      align: 'left',
      indicator: false,
      applied: false,
      tooltip: false
    },
    {
      key: 'from_airport_code',
      name: 'From',
      is_date: false,
      date_formate: '',
      is_sortable: true,
      class: '',
      is_sticky: false,
      align: 'left',
      indicator: false,
      applied: false,
      tooltip: false
    },
    {
      key: 'to_airport_code',
      name: 'To',
      is_date: false,
      date_formate: '',
      is_sortable: true,
      class: '',
      is_sticky: false,
      align: 'left',
      indicator: false,
      applied: false,
      tooltip: false
    },
    {
      key: 'travelDate',
      name: 'Travel Date',
      is_date: true,
      date_formate: 'dd-MM-yyyy HH:mm',
      is_sortable: true,
      class: '',
      is_sticky: false,
      align: 'left',
      indicator: false,
      applied: false,
      tooltip: false
    },
    {
      key: 'tripType',
      name: 'Trip Type',
      is_date: false,
      date_formate: '',
      is_sortable: true,
      class: '',
      is_sticky: false,
      align: 'left',
      indicator: false,
      applied: false,
      toFlight: false,
      tooltip: false
    },
    {
      key: 'cabin',
      name: 'Cabin',
      is_date: false,
      date_formate: '',
      is_sortable: true,
      class: '',
      is_sticky: false,
      align: 'left',
      indicator: false,
      applied: false,
      tooltip: false
    },
    {
      key: 'device',
      name: 'Device',
      is_date: false,
      date_formate: '',
      is_sortable: true,
      class: '',
      is_sticky: false,
      align: 'left',
      indicator: false,
      applied: false,
      tooltip: false
    },
    {
      key: 'supplier_ref_no',
      name: 'Supplier Ref. No.',
      is_date: false,
      date_formate: '',
      is_sortable: true,
      class: '',
      is_sticky: false,
      align: 'left',
      indicator: false,
      applied: false,
      tooltip: true,
      copyClick: true
    },
    {
      key: 'payment_gateway_name',
      name: 'PG',
      is_date: false,
      date_formate: '',
      is_sortable: true,
      class: '',
      is_sticky: false,
      align: 'left',
      indicator: false,
      applied: false,
      tooltip: false
    },
    {
      key: 'travelType',
      name: 'Travel Type',
      is_date: false,
      date_formate: '',
      is_sortable: true,
      class: '',
      is_sticky: false,
      align: 'left',
      indicator: false,
      applied: false,
      tooltip: false
    },

    {
      key: 'ipAddress',
      name: 'IP Address',
      is_date: false,
      date_formate: '',
      is_sortable: true,
      class: '',
      is_sticky: false,
      align: 'left',
      indicator: false,
      applied: false,
      tooltip: false
    },

  ];
  cols = [];
  record: any;
  title: any;

  constructor(
    private flighttabService: FlightTabService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    private toastr: ToasterService,
    public matDialogRef: MatDialogRef<InfoAirlineComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {

    

    super(module_name.info_airline)
    this.cols = this.columns.map((x) => x.key);
    this.key = this.module_name;
    this.sortColumn = 'bookingDate';
    this.sortDirection = 'desc';
    this.Mainmodule = this;

    if (data) {
      this.record = data
      this.title = data.title
    }
  }

  ngOnInit(): void {
    this.searchInputControl.valueChanges
      .subscribe(() => {
        GridUtils.resetPaginator(this._paginator);
        this.refreshItems();
      });
    // this.refreshItems();
  }

  getFilter(): any {
    const filterReq = GridUtils.GetFilterReq(
      this._paginator,
      this._sort,
      this.searchInputControl.value
    );

    filterReq['supplier_id'] = this.record.supplier_id;
    filterReq['Status'] = this.record.status == 'Confirmed Count' ? 'Confirmed' : 'Failed';
    filterReq['Month'] = this.record.type == 'Month Wise' ? this.record.month : '0';
    filterReq['Year'] = this.record.year;
    filterReq['Day'] = this.record.type == 'Day Wise' ? this.record.month : '0';

    return filterReq;
  }

  refreshItems(): void {
    this.isLoading = true;
    this.flighttabService.getAirLineList(this.getFilter()).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.dataList = data.data;
        this._paginator.length = data.total;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  getStatusColor(status: string): string {
    if (status == 'Pending' || status == 'Offline Pending' || status == 'Confirmation Pending' || status == 'Partially Cancelled' || status == 'Hold Released') {
      return 'text-orange-600';
    } else if (status == 'Waiting for Payment' || status == 'Partial Payment Completed' || status == 'Assign To Refund') {
      return 'text-yellow-600';
    } else if (status == 'Confirmed') {
      return 'text-green-600';
    } else if (status == 'Payment Failed' || status == 'Booking Failed' || status == 'Cancelled' || status == 'Rejected' || status == 'Hold Failed') {
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

}
