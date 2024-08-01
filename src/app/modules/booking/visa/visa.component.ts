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
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, bookingsVisaPermissions, messages, module_name } from 'app/security';
import { ToasterService } from 'app/services/toaster.service';
import { Excel } from 'app/utils/export/excel';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { Linq } from 'app/utils/linq';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MarkuppriceInfoComponent } from '../flight/flight/markupprice-info/markupprice-info.component';
import { VisaFilterComponent } from './visa-filter/visa-filter.component';
import { VisaService } from 'app/services/visa.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UserService } from 'app/core/user/user.service';
import { takeUntil } from 'rxjs';

@Component({
    selector: 'app-visa',
    templateUrl: './visa.component.html',
    styleUrls: ['./visa.component.scss'],
    styles: [`
    .tbl-grid {
      grid-template-columns:  40px 250px 170px 170px 200px 190px 130px 80px 100px 150px 120px 70px 120px 140px ;
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
    ]
})
export class VisaComponent extends BaseListingComponent {
    module_name = module_name.visa
    dataList = [];
    total = 0;
    visaFilter: any;
    user: any = {};

    columns = [
        {
            key: 'booking_ref_no', name: 'Reference No.',is_fixed: true, is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false, toBooking: true
        },
        {
            key: 'visa_status', name: 'Status',is_fixed2: true, is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: true, toColor: true
        },
        {
            key: 'entry_date_time', name: 'Date', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
        },
        {
            key: 'operation_person', name: 'Operation Person', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: true
        },
        {
            key: 'agent', name: 'Agent', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: true
        },
        {
            key: 'purchase_price', name: 'Purchase Price', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
        },
        {
            key: 'user_type', name: 'Type', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
        },
        {
            key: 'payment_mode', name: 'MOP', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
        },
        {
            key: 'destination_caption', name: 'Destination', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: true
        },
        {
            key: 'travel_date', name: 'Travel Date', is_date: true, date_formate: 'dd-MM-yyyy', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
        },
        {
            key: 'pax', name: 'Pax', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: true, applied: false, tooltip: false
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
        private matDialog: MatDialog,
        private toasterService: ToasterService,
        private visaService: VisaService,
        private userService: UserService,
        private conformationService: FuseConfirmationService
    ) {
        super(module_name.visa);
        this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'entry_date_time';
        this.sortDirection = 'desc';
        this.Mainmodule = this;

        this.visaFilter = {
            From: '',
            To: '',
            agent_id: '',
            date_: '',
            Status: 'All',
            FromDate: new Date(),
            ToDate: new Date(),
        };

        this.userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: any) => {
                this.user = user;
            });

        this.visaFilter.FromDate.setDate(1);
        this.visaFilter.FromDate.setMonth(this.visaFilter.FromDate.getMonth());
    }

    getFilter(): any {
        const filterReq = GridUtils.GetFilterReq(
            this._paginator,
            this._sort,
            this.searchInputControl.value
        );
        filterReq['date_'] = this.visaFilter.date_ ? DateTime.fromJSDate(new Date(this.visaFilter.date_)).toFormat('yyyy-MM-dd') : '';
        filterReq['FromDate'] = DateTime.fromJSDate(this.visaFilter.FromDate).toFormat('yyyy-MM-dd');
        filterReq['ToDate'] = DateTime.fromJSDate(this.visaFilter.ToDate).toFormat('yyyy-MM-dd');
        filterReq['agent_id'] = this.visaFilter?.agent_id?.id || '';
        filterReq['Status'] = this.visaFilter?.Status == 'All' ? '' : this.visaFilter?.Status;
        return filterReq;
    }

    filter() {
        this.matDialog
            .open(VisaFilterComponent, {
                data: this.visaFilter,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.visaFilter = res;
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


    viewData(record): void {
        if (!Security.hasPermission(bookingsVisaPermissions.modifyPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // let queryParams: any= this.router.navigate([Routes.booking.booking_details_route + '/' + record.id + '/readonly'])
        Linq.recirect('/booking/visa/details/' + record.id);
    }

    bookingRef(record): void {
        if (!Security.hasPermission(bookingsVisaPermissions.modifyPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // if (record?.visa_status !== 'Payment Confirmed') {
        Linq.recirect('/booking/visa/details/' + record.id);
        // }
    }

    startProcess(record): void {
        this.conformationService.open({
            title: 'Start Process',
            message: 'Are you sure to start process of visa ' + record.booking_ref_no + ' ?'
        }).afterClosed().subscribe((res) => {
            if (res === 'confirmed') {
                this.visaService.visaStartProcess(record.id).subscribe({
                    next: res => {
                        if (res) {
                            this.alertService.showToast('success', 'Start Process Successfully!');
                        }
                    }, error: err => {
                        this.alertService.showToast('error', err)
                    }
                })
                Linq.recirect('/booking/visa/details/' + record.id);
            }
        });
    }

    refreshItems() {
        this.isLoading = true;
        var model = this.getFilter();
        if (Security.hasPermission(bookingsVisaPermissions.viewOnlyAssignedPermissions)) {
            model.relationmanagerId = this.user.id
        }

        this.visaService.getVisaBookingList(model).subscribe({
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
        if (!Security.hasExportDataPermission(module_name.bookingsVisa)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // const filterReq = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value);
        // const req = Object.assign(filterReq);

        // req.skip = 0;
        // req.take = this._paginator.length;
        const filterReq = {};
        filterReq['date_'] = this.visaFilter.date_ ? DateTime.fromJSDate(new Date(this.visaFilter.date_)).toFormat('yyyy-MM-dd') : '';
        filterReq['FromDate'] = DateTime.fromJSDate(this.visaFilter.FromDate).toFormat('yyyy-MM-dd');
        filterReq['ToDate'] = DateTime.fromJSDate(this.visaFilter.ToDate).toFormat('yyyy-MM-dd');
        filterReq['agent_id'] = this.visaFilter?.agent_id?.id || '';
        filterReq['Status'] = this.visaFilter?.Status == 'All' ? '' : this.visaFilter?.Status;
        filterReq['Skip'] = 0;
        filterReq['Filter'] = this.searchInputControl.value;
        filterReq['Take'] = this._paginator.length;
        filterReq['OrderBy'] = 'booking_ref_no';
        filterReq['OrderDirection'] = 1;

        this.visaService.getVisaBookingList(filterReq).subscribe(data => {
            for (var dt of data.data) {
                dt.travel_date = DateTime.fromISO(dt.travel_date).toFormat('dd-MM-yyyy')
                dt.entry_date_time = DateTime.fromISO(dt.entry_date_time).toFormat('dd-MM-yyyy HH:mm:ss')
                dt.payment_request_time = DateTime.fromISO(dt.payment_request_time).toFormat('dd-MM-yyyy hh:mm a')

            }
            Excel.export(
                'Visa Booking',
                [
                    { header: 'Reference No.', property: 'booking_ref_no' },
                    { header: 'Status', property: 'visa_status' },
                    { header: 'Date', property: 'entry_date_time' },
                    { header: 'Operation Person', property: 'operation_person' },
                    { header: 'Agent', property: 'agent' },
                    { header: 'Purchase Price', property: 'purchase_price' },
                    { header: 'Type', property: 'user_type' },
                    { header: 'MOP', property: 'payment_mode' },
                    { header: 'Destination', property: 'destination_caption' },
                    { header: 'Travel Date', property: 'travel_date' },
                    { header: 'Pax', property: 'pax' },
                    { header: 'PG', property: 'payment_gateway' },
                    { header: 'IP Address', property: 'ip_address' }
                ],
                data.data, "Visa Booking", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }]);
        });
    }
}
