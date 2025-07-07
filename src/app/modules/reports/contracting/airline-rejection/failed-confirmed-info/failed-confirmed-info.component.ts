import { Component, Inject, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
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
import { Router, RouterOutlet } from '@angular/router';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { messages, module_name, Security } from 'app/security';
import { AirlineSummaryService } from 'app/services/airline-summary.service';
import { Linq } from 'app/utils/linq';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-failed-confirmed-info',
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
  templateUrl: './failed-confirmed-info.component.html',
  styleUrls: ['./failed-confirmed-info.component.scss']
})
export class FailedConfirmedInfoComponent extends BaseListingComponent implements OnDestroy {

  dataList = []; 
  record: any = {};
  title: any;
  isFilterShow: boolean = false;
  statusList = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Waiting for Payment', value: 'Waiting for Payment' },
        { label: 'Confirmed', value: 'Confirmed' },
        { label: 'Offline Pending', value: 'Offline Pending' },
        { label: 'Confirmation Pending', value: 'Confirmation Pending' },
        { label: 'Payment Failed', value: 'Payment Failed' },
        { label: 'Booking Failed', value: 'Booking Failed' },
        { label: 'Cancelled', value: 'Cancelled' },
        { label: 'Partially Cancelled', value: 'Partially Cancelled' },
        { label: 'Hold', value: 'Hold' },
        { label: 'Payment Completed', value: 'Payment Completed' },
        { label: 'Partial Payment Completed', value: 'Partial Payment Completed' },
        { label: 'Assign To Refund', value: 'Assign To Refund' },
        { label: 'Hold Failed', value: 'Hold Failed' },
  ];
  
  constructor(
    public matDialogRef: MatDialogRef<FailedConfirmedInfoComponent>,
    private confirmService: FuseConfirmationService,
    private router: Router,
    private airlineSummaryService: AirlineSummaryService,
    private matDialog: MatDialog,
    public _filterService: CommonFilterService,
    @Inject(MAT_DIALOG_DATA) public data: any = {}

  ) {
    super(module_name.airline_rejection)
    this.key = 'ticket_Date_Time';
    this.sortColumn = 'ticket_Date_Time';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this.record = data

    if (this.record.send == 'Sub') {
      this.title = this.record.carrier
    } else if (this.record.send == 'Main') {
      this.title = this.record.supplier
    } else {
      this.title = this.record.titleName
    }
  }

  ngOnInit(): void {
  }

  refreshItems(event?: any): void {
    this.isLoading = true;

    const request = this.getNewFilterReq(event);
    request['supplier'] = this.record.supplier;
    request['From_Date'] = this.record.From_Date;
    request['To_Date'] = this.record.To_Date;
    request['carrier'] = this.record.carrier;
    request['filterArea'] = this.record.filterArea;
    
    const hasColumeFiltersDate = !!request.columeFilters?.ticket_Date_Time;
    if (hasColumeFiltersDate) {
      request['From_Date'] = '';
      request['To_Date'] = '';
    }

    this.airlineSummaryService.airlineRejectionBookingDetailsAnalysis(request).subscribe({
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

  viewData(record): void {
    if (!Security.hasViewDetailPermission(module_name.airline_rejection)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }
    Linq.recirect('/booking/flight/details/' + record.id);
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  getStatusColor(status: string): string {
    if (status == 'Pending' || status == 'Offline Pending' || status == 'Confirmation Pending' || status == 'Partially Cancelled' || status == 'Hold Released') {
      return 'text-orange-600';
    } else if (status == 'Waiting for Payment' || status == 'Partial Payment Completed' || status == 'Assign To Refund' || status == 'Payment Completed') {
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

  exportExcel(): void {
    if (!Security.hasExportDataPermission(module_name.airline_rejection)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const filterReq = this.getNewFilterReq({});
    filterReq['Take'] = this.totalRecords;
    filterReq['supplier'] = this.record.supplier;
    filterReq['From_Date'] = this.record.From_Date;
    filterReq['To_Date'] = this.record.To_Date;
    filterReq['carrier'] = this.record.carrier;
    filterReq['filterArea'] = this.record.filterArea;

    this.airlineSummaryService.airlineRejectionBookingDetailsAnalysis(filterReq).subscribe(data => {
      for (var dt of data.data) {
        dt.ticket_Date_Time = dt.ticket_Date_Time ? DateTime.fromISO(dt.ticket_Date_Time).toFormat('dd-MM-yyyy HH:mm:ss') : '';
      }
      Excel.export(
        this.title,
        [
          { header: 'Ticket Date/Time', property: 'ticket_Date_Time' },
          { header: 'Booking No', property: 'booking_No' },
          { header: 'Supplier Ref.', property: 'supplier_Ref' },
          { header: 'From', property: 'from' },
          { header: 'To', property: 'to' },
          { header: 'Career', property: 'carrier' },
          { header: 'Error Description', property: 'error_Description' },
        ],
        data.data, this.title, [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }]);
    });
  }

}
