// import { WorkingStatusComponent } from './../../masters/employee/dialogs/working-status/working-status.component';
// import { FuseConfirmationService } from './../../../../@fuse/services/confirmation/confirmation.service';
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
import { Security, amendmentRequestsPermissions, messages, module_name } from 'app/security';
import { AmendmentRequestsService } from 'app/services/amendment-requests.service';
import { UpdateChargeComponent } from './update-charge/update-charge.component';
import { MatDialog } from '@angular/material/dialog';
import { AmendmentRequestEntryComponent } from './amendment-request-entry/amendment-request-entry.component';
import { StatusLogComponent } from './status-log/status-log.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DateTime } from 'luxon';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { Excel } from 'app/utils/export/excel';
import { mode } from 'crypto-js';
import { ToasterService } from 'app/services/toaster.service';
import { FilterComponent } from './filter/filter.component';

@Component({
    selector: 'app-amendment-requests-list',
    templateUrl: './amendment-requests-list.component.html',
    styles: [
        `
            .tbl-grid {
                grid-template-columns: 40px 220px 220px 220px 170px 170px 170px 120px 120px 180px 180px 140px;
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
export class AmendmentRequestsListComponent
    extends BaseListingComponent
    implements OnDestroy {

    module_name = module_name.amendmentRequests;
    dataList = [];
    total = 0;

    AmendmentFilter: any

    columns = [
        // {
        //     key: 'is_request_sent_to_supplier',
        //     is_date: false,
        //     date_formate: '',
        //     is_sortable: true,
        //     class: '',
        //     is_sticky: false,
        //     width: '10',
        //     align: 'center',
        //     indicator: false,
        //     is_required: false,
        //     is_boolean: false,
        //     inicon: true,
        // },
        {
            key: 'reference_no',
            name: 'Ref. No',
            is_date: false,
            is_fixed: true,
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
            key: 'amendment_type',
            name: 'Type',
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
            key: 'amendment_status',
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
            toColor: true,
        },
        {
            key: 'agency_name',
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
            key: 'company_name',
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
            key: 'booking_ref_no',
            name: 'Flight No.',
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
            tooltip: true,
        },
        {
            key: 'gds_pnr',
            name: 'GDS PNR',
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
            key: 'amendment_request_time',
            name: 'Requested On',
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
            key: 'travel_date',
            name: 'Travel Date',
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
            key: 'amendment_confirmation_time',
            name: 'Confirmed',
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
            tooltip: true,
        },
    ];
    cols = [];
    isMenuOpen: boolean = false;
    constructor(
        private amendmentrequestsService: AmendmentRequestsService,
        private matDialog: MatDialog,
        private toasterService: ToasterService,
        private confirmationService: FuseConfirmationService
    ) {
        super(module_name.amendmentRequests);
        this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'amendment_request_time';
        this.sortDirection = 'desc';
        this.Mainmodule = this;

        this.AmendmentFilter = {
            agent_id: '',
            supplierId: '',
            type: 'All',
            status: 'All',
            FromDate: new Date(),
            ToDate: new Date(),
        };
        this.AmendmentFilter.FromDate.setDate(1);
        this.AmendmentFilter.FromDate.setMonth(this.AmendmentFilter.FromDate.getMonth() - 3);

    }

    ngOnInit() {
        this.isMenuOpen = Security.hasPermission(amendmentRequestsPermissions.manuDisplayPermissions);
    }

    getFilter(): any {
        const filterReq = GridUtils.GetFilterReq(
            this._paginator,
            this._sort,
            this.searchInputControl.value
        );

        filterReq['FromDate'] = DateTime.fromJSDate(this.AmendmentFilter.FromDate).toFormat('yyyy-MM-dd');
        filterReq['ToDate'] = DateTime.fromJSDate(this.AmendmentFilter.ToDate).toFormat('yyyy-MM-dd');
        filterReq['agent_id'] = this.AmendmentFilter?.agent_id?.id || '';
        filterReq['supplier_id'] = this.AmendmentFilter?.supplier_id?.id || '';
        filterReq['status'] = this.AmendmentFilter?.status == 'All' ? '' : this.AmendmentFilter?.status;
        filterReq['type'] = this.AmendmentFilter?.type == 'All' ? '' : this.AmendmentFilter?.type;
        return filterReq;
    }

    refreshItems(): void {
        this.isLoading = true;

        this.amendmentrequestsService
            .getAirAmendmentList(this.getFilter())
            .subscribe({
                next: (data) => {
                    this.isLoading = false;

                    const cancel = { label: 'Cancel', icon: 'cancel', status: 'Cancelled' };
                    const reject = { label: 'Reject', icon: 'block', status: 'Rejected' };
                    // const completed = { label: 'Complete', icon: 'task_alt', status: 'Completed' };
                    const sendRequest = { label: 'Send Request to Supplier', icon: 'send', status: 'Inprocess' };

                    data.data.forEach(x => {
                        x.actionStatus = [];
                        switch (x.amendment_status) {
                            case 'Pending':
                                x.actionStatus.push(cancel);
                                x.actionStatus.push(sendRequest);
                                x.class = 'text-gray-500';
                                break;
                            case 'Inprocess':
                                x.actionStatus.push(cancel);
                                x.actionStatus.push(reject);
                                // x.actionStatus.push(completed);
                                x.class = 'text-orange-500';
                                break;
                            case 'Cancelled':
                                x.class = 'text-red-500';
                                break;
                            case 'Confirm':
                                x.actionStatus.push(cancel);
                                x.actionStatus.push(reject);
                                x.class = 'text-green-500';
                                break;
                            case 'Rejected':
                                x.class = 'text-red-500';
                                break;
                            case 'Completed':
                                x.class = 'text-green-500';
                                break;
                            case 'Quotation Sent':
                                x.actionStatus.push(cancel);
                                x.class = 'text-blue-500';
                                break;
                            case 'Expired':
                                x.class = 'text-red-500';
                                break;
                        }
                    })
                    this.dataList = data.data;
                    this._paginator.length = data.total;
                },
                error: (err) => {
                    this.toasterService.showToast('error', err)
                    this.isLoading = false;
                },
            });
    }

    changeStatus(data, status): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.changeStatusPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.confirmationService.open({
            title: 'Status Change to ' + status.status,
            message: 'Are you sure to change status to ' + status.status + ' ?',
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed')
                this.amendmentrequestsService.setAmendmentStatus(data.id, status.status).subscribe((data) => {
                    this.refreshItems();
                    this.alertService.showToast('success', "Amendment status changed!", "top-right", true);
                })
        })
    }

    filter() {
        this.matDialog
            .open(FilterComponent, {
                data: this.AmendmentFilter,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.AmendmentFilter = res;
                    this.refreshItems();
                }
            });
    }

    complete(model): void {
        const amendment = {}
        amendment['agent_id'] = model.agent_id;
        amendment['amendment_id'] = model.id;
        amendment['payment_method'] = 'Wallet';
        this.confirmationService.open({
            title: 'Amendment process',
            message: 'Are you sure to complete this amendment process ?',
            icon: { show: true, name: 'heroicons_outline:check-circle', color: 'primary', }
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.amendmentrequestsService.amendmentChargesDeduction(amendment).subscribe(() => {
                    this.alertService.showToast('success', "Amendment process completed!", "top-right", true);
                    this.refreshItems();
                })
            }
        })
    }

    confirm(model) {
        if (!Security.hasPermission(amendmentRequestsPermissions.confirmPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const json = {
            id: model.id,
            status: 'Confirm'
        }
        this.confirmationService.open({
            title: 'Amendment Confirm',
            message: 'Are you sure to confirm this amendment process ?',
            icon: { show: true, name: 'heroicons_outline:check-circle', color: 'primary', }
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.amendmentrequestsService.setAmendmentStatusQ(json).subscribe(() => {
                    this.alertService.showToast('success', "Amendment confirmed!", "top-right", true);
                    this.refreshItems();
                })
            }
        })
    }

    getStatusColor(status: string): string {
        if (status == 'Pending' || status == 'Inprocess' || status == 'Partial Cancellation Pending') {
            return 'text-orange-600';
        } else if (status == 'Waiting for Payment' || status == 'Partial Payment Completed') {
            return 'text-yellow-600';
        } else if (status == 'Completed' || status == 'Confirm') {
            return 'text-green-600';
        } else if (status == 'Payment Failed' || status == 'Booking Failed' || status == 'Cancelled' || status == 'Rejected') {
            return 'text-red-600';
        } else if (status == 'Quotation Sent') {
            return 'text-blue-600';
        } else {
            return '';
        }
    }

    completeAmendment(model) {
        if (!Security.hasPermission(amendmentRequestsPermissions.completePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.confirmationService.open({
            title: 'Amendment process',
            message: 'Are you sure to complete this amendment process ?',
            icon: { show: true, name: 'heroicons_outline:check-circle', color: 'primary', }
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.amendmentrequestsService.completeAmendment(model.id).subscribe({
                    next: (value: any) => {
                        this.alertService.showToast('success', "Amendment process completed!", "top-right", true);
                        this.refreshItems();
                    }, error: (err) => {
                        this.alertService.showToast('error', err, "top-right", true);
                    },
                })
            }
        })
    }

    showUpdateCharge(data): boolean {
        return ['Inprocess', 'Quotation Sent'].includes(data.amendment_status);
        // return (data.amendment_status);
    }

    updateCharge(model): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.updateChargePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(UpdateChargeComponent, {
            data: model,
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res) {
                this.alertService.showToast('success', "Charge has been Updated!", "top-right", true);
                this.refreshItems();
            }
        })
    }



    statusLogs(model): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.statusLogsPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(StatusLogComponent, {
            data: model,
            disableClose: true
        })
    }

    viewInternal(record): void {

        this.matDialog.open(AmendmentRequestEntryComponent, {
            data: { data: record, readonly: true, showUpdateCharge: this.showUpdateCharge(record) },
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res) {
                this.refreshItems();
            }
        })
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

    exportExcel(): void {
        if (!Security.hasExportDataPermission(this.module_name)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // const filterReq = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value);
        // const req = Object.assign(filterReq);

        // req.skip = 0;
        // req.take = this._paginator.length;
        const filterReq = {};
        filterReq['FromDate'] = DateTime.fromJSDate(this.AmendmentFilter.FromDate).toFormat('dd-MM-yyyy');
        filterReq['ToDate'] = DateTime.fromJSDate(this.AmendmentFilter.ToDate).toFormat('dd-MM-yyyy');
        filterReq['agent_id'] = this.AmendmentFilter?.agent_id?.id || '';
        filterReq['supplier_id'] = this.AmendmentFilter?.supplier_id?.id || '';
        filterReq['status'] = this.AmendmentFilter?.status == 'All' ? '' : this.AmendmentFilter?.status;
        filterReq['type'] = this.AmendmentFilter?.type == 'All' ? '' : this.AmendmentFilter?.type;
        filterReq['Skip'] = 0;
        filterReq['Filter'] = this.searchInputControl.value;
        filterReq['Take'] = this._paginator.length;
        filterReq['OrderBy'] = 'amendment_request_time';
        filterReq['OrderDirection'] = 1;


        this.amendmentrequestsService.getAirAmendmentList(filterReq).subscribe(data => {
            for (var dt of data.data) {
                dt.amendment_request_time = DateTime.fromISO(dt.amendment_request_time).toFormat('dd-MM-yyyy HH:mm:ss')
                dt.travel_date = DateTime.fromISO(dt.travel_date).toFormat('dd-MM-yyyy HH:mm:ss')
            }
            Excel.export(
                'Amendment Booking',
                [
                    { header: 'Ref No.', property: 'reference_no' },
                    { header: 'Type', property: 'amendment_type' },
                    { header: 'Status', property: 'amendment_status' },
                    { header: 'Agent', property: 'agency_name' },
                    { header: 'Supplier', property: 'company_name' },
                    { header: 'Request On', property: 'amendment_request_time' },
                    { header: 'Travel Date', property: 'travel_date' },
                    { header: 'Confirmed', property: 'amendment_confirmation_time' },
                ],
                data.data, "Amendment Booking", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]);
        });
    }
}
