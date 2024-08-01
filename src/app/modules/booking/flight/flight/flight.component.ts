import { NgIf, NgFor, DatePipe, CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { Routes } from 'app/common/const';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, bookingsFlightPermissions, messages, module_name } from 'app/security';
import { FlightTabService } from 'app/services/flight-tab.service';
import { Excel } from 'app/utils/export/excel';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { Linq } from 'app/utils/linq';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FlightFilterComponent } from './flight-filter/flight-filter.component';
import { MarkuppriceInfoComponent } from './markupprice-info/markupprice-info.component';
import { ImportPnrComponent } from './import-pnr/import-pnr.component';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { ToasterService } from 'app/services/toaster.service';
import { StatusUpdateComponent } from './status-update/status-update.component';


@Component({
    selector: 'app-flight',
    templateUrl: './flight.component.html',
    styleUrls: ['./flight.component.scss'],
    styles: [`
    .tbl-grid {
      grid-template-columns:  40px 240px 170px 170px 130px 130px 150px 140px  120px 100px 300px 90px 90px 180px 120px 140px 120px 170px 150px 140px 141px;
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
export class FlightComponent extends BaseListingComponent {
    flightFilter: any;
    module_name = module_name.flight;
    dataList = [];
    total = 0;

    public startDate = new FormControl();
    public endDate = new FormControl();
    public StartDate: any;
    public EndDate: any;

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
            key: 'status',
            name: 'Status',
            is_date: false,
            is_fixed2: true,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            applied: false,
            toColor: true,
            tooltip: true
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
            key: 'supplier_name',
            name: 'Supplier',
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
            key: 'purchase_price',
            name: 'Purchase Price',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: 'header-view-center',
            is_sticky: false,
            align: 'center',
            indicator: true,
            applied: false,
            tooltip: true
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
    // clipboard: any;
    // toastr: any;

    constructor(
        private flighttabService: FlightTabService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        private toastr: ToasterService,

        private clipboard: Clipboard,
        private router: Router
    ) {
        super(module_name.flight);
        this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'bookingDate';
        this.sortDirection = 'desc';
        this.Mainmodule = this;

        this.flightFilter = {
            fromCity: '',
            toCity: '',
            booking_date: '',
            status: ['All'],
            fromcityfilter: '',
            supplier_id: [{
                "id": "all",
                "company_name": "All"
              }],
            FromDate: new Date(),
            ToDate: new Date(),
        };
        this.flightFilter.FromDate.setDate(1);
        this.flightFilter.FromDate.setMonth(this.flightFilter.FromDate.getMonth()-3);
    }

    ngOnInit() {
    }

    copy(link) {
        this.clipboard.copy(link);
        this.toastr.showToast('success', 'Copied');
    }

    getFilter(): any {
        const filterReq = GridUtils.GetFilterReq(
            this._paginator,
            this._sort,
            this.searchInputControl.value
        );

        filterReq['FromDate'] = DateTime.fromJSDate(this.flightFilter.FromDate).toFormat('yyyy-MM-dd');
        filterReq['ToDate'] = DateTime.fromJSDate(this.flightFilter.ToDate).toFormat('yyyy-MM-dd');
        filterReq['agent_for'] = this.flightFilter?.agent_for;
        filterReq['agent_id'] = this.flightFilter?.agent_id?.id || '';
        filterReq['from'] = this.flightFilter?.fromCity?.id == 'All' ? '' : this.flightFilter?.fromCity?.id ;
        filterReq['to'] = this.flightFilter?.toCity?.id == 'All' ? '' : this.flightFilter?.toCity?.id;
        filterReq['supplier_id'] = this.flightFilter?.supplier_id?.map(x => x.id).join(',') == 'all' ? '' : this.flightFilter?.supplier_id?.map(x => x.id).join(',');
        // filterReq['status'] = this.flightFilter?.status == 'All' ? '' : this.flightFilter?.status;
        filterReq['status'] = this.flightFilter?.status == 'All' ? '' : this.flightFilter?.status.join(',');

        return filterReq;
    }

    refreshItems(): void {
        this.isLoading = true;
        this.flighttabService.getAirBookingList(this.getFilter()).subscribe({
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

    importPnr() {
        if (!Security.hasPermission(bookingsFlightPermissions.importPNRPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(ImportPnrComponent,
            { data: null, disableClose: true, })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.alertService.showToast('success', 'New record added', 'top-right', true);
                    this.refreshItems();
                }
            });
    }

    viewField(data: any): void {
        if (data.fields.length == null) {
            return;
        } else {
            this.matDialog
                .open(MarkuppriceInfoComponent, {
                    disableClose: true,
                    data: { data: data.fields, title: "Markups & Price" },
                })
                .afterClosed()
                .subscribe({
                    next: (value) => { },
                });
        }
    }

    viewData(record): void {
        if (!Security.hasViewDetailPermission(module_name.bookingsFlight)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // let queryParams: any= this.router.navigate([Routes.booking.booking_details_route + '/' + record.id + '/readonly'])
        Linq.recirect('/booking/flight/details/' + record.id);
    }

    filter() {
        this.matDialog
            .open(FlightFilterComponent, {
                data: this.flightFilter,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.flightFilter = res;
                    this.refreshItems();
                }
            });
    }

    statusUpdate(data){
        this.matDialog
            .open(StatusUpdateComponent, {
                data: data,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    // this.flightFilter = res;
                    this.refreshItems();
                }
            });
    }

    getStatusColor(status: string): string {
        if (status == 'Pending' || status == 'Offline Pending' || status == 'Confirmation Pending' || status == 'Partially Cancelled') {
            return 'text-orange-600';
        } else if (status == 'Waiting for Payment' || status == 'Partial Payment Completed') {
            return 'text-yellow-600';
        } else if (status == 'Confirmed') {
            return 'text-green-600';
        } else if (status == 'Payment Failed' || status == 'Booking Failed' || status == 'Cancelled' || status == 'Rejected') {
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

    ngOnDestroy(): void {
        this.masterService.setData(this.key, this);
    }

    offlinePnr() {
        if (!Security.hasPermission(bookingsFlightPermissions.offlinePNRPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.router.navigate([Routes.booking.booking_details_offline_route])
    }

    exportExcel(): void {
        if (!Security.hasExportDataPermission(module_name.bookingsFlight)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // const filterReq = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value);
        // const req = Object.assign(filterReq);

        // req.skip = 0;
        // req.take = this._paginator.length;
        const filterReq = {};

        filterReq['FromDate'] = DateTime.fromJSDate(this.flightFilter.FromDate).toFormat('yyyy-MM-dd');
        filterReq['ToDate'] = DateTime.fromJSDate(this.flightFilter.ToDate).toFormat('yyyy-MM-dd');
        filterReq['agent_for'] = this.flightFilter?.agent_for;
        filterReq['agent_id'] = this.flightFilter?.agent_id?.id || '';
        filterReq['fromCity'] = this.flightFilter?.fromCity?.id || '';
        filterReq['toCity'] = this.flightFilter?.toCity?.id || '';
        filterReq['supplier_id'] = this.flightFilter?.supplier_id?.map(x => x.id).join(',') == 'all' ? '' : this.flightFilter?.supplier_id?.map(x => x.id).join(',');
        filterReq['status'] = this.flightFilter?.status.join(',');
        filterReq['Filter'] = this.searchInputControl.value;
        filterReq['Skip'] = 0;
        filterReq['Take'] = this._paginator.length;
        filterReq['OrderBy'] = 'booking_ref_no';
        filterReq['OrderDirection'] = 1;

        this.flighttabService.getAirBookingList(filterReq).subscribe(data => {
            for (var dt of data.data) {
                dt.bookingDate = DateTime.fromISO(dt.bookingDate).toFormat('dd-MM-yyyy HH:mm:ss')
                dt.travelDate = DateTime.fromISO(dt.travelDate).toFormat('dd-MM-yyyy HH:mm:ss')
                dt.from = dt.from + ' to ' + dt.to + ' - ' + dt.cabin;
                dt.pax = 'Adult: ' + dt.adults + ', child: ' + dt.child + ', Infants:' + dt.infants;
                // dt.fieldslist = '';
                // for (var fl of dt.fields) {
                //   dt.fieldslist = dt.fieldslist + fl.key + ' - ' + fl.value + ', ';
                // }
            }
            Excel.export(
                'Flight Booking',
                [
                    { header: 'Reference No.', property: 'booking_ref_no' },
                    { header: 'Status', property: 'status' },
                    { header: 'Date', property: 'bookingDate' },
                    { header: 'PNR', property: 'pnr' },
                    { header: 'GDS PNR', property: 'gds_pnr' },
                    { header: 'Supplier', property: 'supplier_name' },
                    { header: 'Purchase Price', property: 'purchase_price' },
                    { header: 'Type', property: 'user_type' },
                    { header: 'MOP', property: 'mop' },
                    { header: 'Agent', property: 'agent_name' },
                    { header: 'From', property: 'from_airport_code' },
                    { header: 'To', property: 'to_airport_code' },
                    { header: 'Travel Date', property: 'travelDate' },
                    { header: 'Trip Type', property: 'tripType' },
                    { header: 'Cabin', property: 'cabin' },
                    { header: 'Device', property: 'device' },
                    { header: 'Supplier Ref.No.', property: 'supplier_ref_no' },
                    { header: 'PG', property: 'payment_gateway_name' },
                    { header: 'Travel Type', property: 'travelType' },
                    { header: 'IP Address', property: 'ipAddress' },
                ],
                data.data, "Flight Booking", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]);
        });
    }
}
