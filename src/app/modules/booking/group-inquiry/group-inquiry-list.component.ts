import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, groupInquiryPermissions, messages, module_name } from 'app/security';
import { MatDialog } from '@angular/material/dialog';
import { GroupInquiryService } from 'app/services/group-inquiry.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { DateTime } from 'luxon';
import { Excel } from 'app/utils/export/excel';
import { UpdateChargeComponent } from './update-charge/update-charge.component';
import { Linq } from 'app/utils/linq';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'app-group-inquiry-list',
    templateUrl: './group-inquiry-list.component.html',
    styles: [
        `
            .tbl-grid {
                grid-template-columns: 40px 240px 150px 150px 140px 150px 180px 180px 100px 200px;
            }
        `,
    ],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatProgressBarModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatMenuModule,
        MatTooltipModule,
        MatDividerModule,
        NgClass,
    ],
})
export class GroupInquiryListComponent
    extends BaseListingComponent
    implements OnDestroy {

    module_name = module_name.groupInquiry;
    dataList = [];
    total = 0;

    columns = [
        {
            key: 'booking_ref_no',
            name: 'Ref No.',
            is_date: false,
            is_fixed:true,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            is_required: false,
            is_boolean: false,
            inicon: false,
            tooltip: true,
        },
        {
            key: 'agent_name',
            name: 'Agent',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            is_required: false,
            is_boolean: false,
            inicon: false,
            tooltip: true,
        },
        {
            key: 'supplier_name',
            name: 'Supplier',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            is_required: false,
            is_boolean: false,
            inicon: false,
            tooltip: true,
        },
        {
            key: 'booking_status',
            name: 'Status',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            is_required: false,
            is_boolean: false,
            inicon: false,
            tooltip: true,
        },
        {
            key: 'pnr',
            name: 'PNR',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            is_required: false,
            is_boolean: false,
            inicon: false,
            tooltip: false,
        },
        {
            key: 'departure_date',
            name: 'Departure Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy HH:mm:ss',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            is_required: false,
            is_boolean: false,
            inicon: false,
            tooltip: false,
        },
        {
            key: 'arrival_date',
            name: 'Arrival Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy HH:mm:ss',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            is_required: false,
            is_boolean: false,
            inicon: false,
            tooltip: false,
        },
        {
            key: 'trip_type',
            name: 'Trip Type',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            is_required: false,
            is_boolean: false,
            inicon: false,
            tooltip: true,
        },
        {
            key: 'pax',
            name: 'Pax',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            is_required: false,
            is_boolean: false,
            inicon: false,
            tooltip: true,
        },

    ];
    cols = [];

    constructor(
        private groupInquiryService: GroupInquiryService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
    ) {
        super(module_name.groupInquiry);
        this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'departure_date';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
    }

    refreshItems(): void {
        this.isLoading = true;
        var model = GridUtils.GetFilterReq(this._paginator, this.sort, this.searchInputControl.value, 'departure_date', 1);

        this.groupInquiryService.getAirGroupInquiryList(model).subscribe({
            next: (data: any) => {
                this.dataList = data.data;
                this.dataList.forEach(x => {
                    x.pax = 'Adult:' + x.adults + " child:" + x.child + " Infants:" + x.infants;
                });
                this.isLoading = false;
                this._paginator.length = data.total;
            }, error: (err) => {
                this.isLoading = false;
                this.alertService.showToast('error', err);
            },
        })
    }

    UpdateCharge(data: any): void {
        if (!Security.hasPermission(groupInquiryPermissions.updateChargePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(UpdateChargeComponent,
            {
                data: data,
                disableClose: false
            }).afterClosed().subscribe(res => {
                if (res)
                    this.refreshItems();
            })
    }

    viewInternal(data: any): void {
        Linq.recirect('/booking/group-inquiry/details/' + data.id);
    }

    exportExcel() {
        if (!Security.hasExportDataPermission(this.module_name)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const filterReq = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value, 'departure_date', 1);
        const req = Object.assign(filterReq);

        req.skip = 0;
        req.take = this._paginator.length;

        this.groupInquiryService.getAirGroupInquiryList(req).subscribe(data => {
            for (var dt of data.data) {
                dt.departure_date = DateTime.fromISO(dt.departure_date).toFormat('dd-MM-yyyy hh:mm a');
                dt.arrival_date = DateTime.fromISO(dt.arrival_date).toFormat('dd-MM-yyyy hh:mm a');
                dt.pax = 'Adult:' + dt.adults + " child:" + dt.child + " Infants:" + dt.infants;
            }
            Excel.export(
                'Group Inquiry',
                [
                    { header: 'Ref No.', property: 'booking_ref_no' },
                    { header: 'Agent', property: 'agent_name' },
                    { header: 'Supplier', property: 'supplier_name' },
                    { header: 'Status', property: 'booking_status' },
                    { header: 'PNR', property: 'pnr' },
                    { header: 'Departure Date', property: 'departure_date' },
                    { header: 'Arrival Date', property: 'arrival_date' },
                    { header: 'Trip Type', property: 'trip_type' },
                    { header: 'Pax', property: 'pax' },
                ],
                data.data, "Group Inquiry", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }]);
        });
    }

    getNodataText(): string {
        if (this.isLoading) return 'Loading...';
        else if (this.searchInputControl.value)
            return `No search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    ngOnDestroy(): void {
        this.masterService.setData(this.key, this);
    }

    setBookingStatus(data: any) {
        if (!Security.hasPermission(groupInquiryPermissions.groupInquirySubPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.conformationService
            .open({
                title: 'Complete Inquiry',
                message: 'Are you sure to complete this inquiry?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.groupInquiryService.setBookingStatus({ id: data.id, Status: 'Completed' }).subscribe({
                        next: (value) => {
                            this.alertService.showToast('success', "Inquiry has been completed.");
                            this.refreshItems();
                        }, error: (err) => {
                            this.alertService.showToast('error', err);
                        },
                    })
                }
            });
    }

    Reject(record: any): void {
        const label: string = 'Reject Group Inquiry'
        this.conformationService.open({
          title: label,
          message: 'Are you sure to ' + label.toLowerCase() + ' ?'
        }).afterClosed().subscribe({
          next: (res) => {
            if (res === 'confirmed') {
              this.groupInquiryService.setBookingStatus({ id: record.id, Status: 'Rejected' }).subscribe({
                next: () => {
                  this.alertService.showToast('success', "Group Inquiry Rejected", "top-right", true);
                  this.refreshItems();
                }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
              });
            }
          }
        })
      }
}
