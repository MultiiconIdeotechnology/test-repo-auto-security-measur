import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
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
import { ToasterService } from 'app/services/toaster.service';
import { FilterComponent } from './filter/filter.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentService } from 'app/services/agent.service';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { EntityService } from 'app/services/entity.service';
import { takeUntil } from 'rxjs';

@Component({
    selector: 'app-amendment-requests-list',
    templateUrl: './amendment-requests-list.component.html',
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
        MatDatepickerModule,
        MatMenuModule,
        MatTooltipModule,
        MatDividerModule,
        NgClass,
        PrimeNgImportsModule,
        UpdateChargeComponent,
        AmendmentRequestEntryComponent
    ],
})
export class AmendmentRequestsListComponent
    extends BaseListingComponent  {
    isFilterShow: boolean = false;
    module_name = module_name.amendmentRequests;
    dataList = [];
    total = 0;

    AmendmentFilter: any;

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
    selectedAgent!: string;
    selectedSupplier!: string;
    agentList: any[] = [];
    supplierList: any[] = [];
    isMenuOpen: boolean = false;

    typeList = ['Cancellation Quotation', 'Instant Cancellation', 'Full Refund', 'Reissue Quotation', 'Miscellaneous', 'No Show', 'Void', 'Correction Quotation', 'Wheel Chair', 'Meal Quotation(SSR)', 'Baggage Quotation(SSR)'];
    statusList = [
        "Request Sent to Supplier",
        "Request to Supplier Failed",
        "Quotation Sent",
        "Quotation Confirmed By TA",
        "Quotation Rejected By TA",
        "Confirmation Sent To Supplier",
        "Payment Completed",
        "Refund Process",
        "Refund Completed",
        "Completed",
        "Rejected",
        "Cancelled",
        "Partial Payment Completed"
    ];
    statusListForAgent = [
        "Request Sent",
        "Quotation Received",
        "Quotation Confirmed",
        "Payment Completed",
        "Quotation Rejected",
        "Inprocess",
        "Refund Initiated",
        "Completed",
        "Rejected",
        "Cancelled",
    ];
    constructor(
        private amendmentrequestsService: AmendmentRequestsService,
        private matDialog: MatDialog,
        private toasterService: ToasterService,
        private agentService: AgentService,
        private kycDocumentService: KycDocumentService,
        private confirmationService: FuseConfirmationService,
        private entityService: EntityService
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

        this.entityService.onraiserefreshUpdateChargeCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                console.log("item", item);
                if(item) {
                    // this.alertService.showToast('success', "Charge has been Updated!", "top-right", true);
                    this.refreshItems();
                }
            }
        });
    }

    ngOnInit() {
        this.isMenuOpen = Security.hasPermission(amendmentRequestsPermissions.manuDisplayPermissions);
        this.getAgent("", true);
        this.getSupplier("", true);
    }

    // Get Filter
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

    // Get Agent Data
    getAgent(value: string, bool: boolean = true) {
        this.agentService.getAgentComboMaster(value, bool).subscribe((data) => {
            this.agentList = data;

            for(let i in this.agentList){
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`
            }
        });
    }

    // Get Supplier
    getSupplier(value: string, bool: boolean = true) {
        this.kycDocumentService.getSupplierCombo(value, 'Airline').subscribe((data) => {
            this.supplierList = data;
        });
    }

    // Refresh Items
    refreshItems(event?: any): void {
        this.isLoading = true;
        let extraModel = this.getFilter();
        let newModel = this.getNewFilterReq(event)
        var model = { ...extraModel, ...newModel };

        this.amendmentrequestsService.getAirAmendmentList(model).subscribe({
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
                });
                this.dataList = data.data;
                this.totalRecords = data.total;
                if (this.dataList && this.dataList.length) {
                    setTimeout(() => {
                        this.isFrozenColumn('', ['reference_no']);
                    }, 200);
                }
            }, error: (err) => {
                this.toasterService.showToast('error', err)
                this.isLoading = false;
            },
        });
    }

    // Filter Dialog Open
    filter() {
        this.matDialog.open(FilterComponent, {
            data: this.AmendmentFilter,
            disableClose: true,
        }).afterClosed().subscribe((res) => {
            if (res) {
                this.AmendmentFilter = res;
                this.refreshItems();
            }
        });
    }

    // Status wise color
    getStatusColor(status: string): string {
        if (status == 'Refund Process' || status == 'Inprocess') {
            return 'text-orange-600';
        } else if (status == 'Quotation Sent' || status == "Partial Payment Completed") {
            return 'text-yellow-600';
        } else if (status == 'Quotation Confirmed By TA' || status == 'Completed' || status == 'Confirm' || status == 'Quotation Confirmed') {
            return 'text-green-600';
        } else if (status == 'Request to Supplier Failed' || status == "Quotation Rejected By TA" || status == "Rejected" || status == "Cancelled") {
            return 'text-red-600';
        } else if (status == 'Request Sent to Supplier' || status == "Confirmation Sent To Supplier" || status == "Payment Completed" || status == "Refund Completed") {
            return 'text-blue-600';
        } else {
            return '';
        }
    }

    // Agent status wise color
    getStatusColorForAgent(status: string): string {
        if (status == 'Request Sent' || status == 'Inprocess') {
            return 'text-orange-600';
        } else if (status == 'Partial Payment Completed') {
            return 'text-yellow-600';
        } else if (status == 'Quotation Confirmed' || status == 'Completed') {
            return 'text-green-600';
        } else if (status == 'Quotation Rejected' || status == 'Rejected' || status == 'Cancelled') {
            return 'text-red-600';
        } else if (status == 'Quotation Received' || status == 'Payment Completed' || status == 'Refund Initiated') {
            return 'text-blue-600';
        } else {
            return '';
        }
    }

    // Complete Amendment
    completeAmendment(model: any) {
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

    // Show update charge
    showUpdateCharge(data: any): boolean {
        return (data.amendment_status != 'Rejected' && data.amendment_status != 'Completed' && data.amendment_status != 'Cancelled');
    }

    // Update Charge Drawer Action
    updateCharge(model: any): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.updateChargePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // UpdateChargeComponent
        this.entityService.raiseUpdateChargeCall({ data: model });
    }

    // Confirmation Action
    confirmation(data: any): void {
        this.confirmationService.open({
            title: "Confirm Amendment",
            message: 'Are you sure to confirm ' + data.reference_no + ' amendment?'
        }).afterClosed().subscribe(ress => {
            if (ress === 'confirmed') {
                const json = {
                    id: data.id
                }

                this.amendmentrequestsService.confirmAmendment(json).subscribe({
                    next: (res) => {
                        this.alertService.showToast('success', 'Amendment Confirmed!');
                        this.refreshItems();
                    }, error: (err) => {
                        this.alertService.showToast('error', err)
                    }
                })
            }
        })
    }

    // Status Logs Action
    statusLogs(model: any): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.statusLogsPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(StatusLogComponent, {
            data: model,
            disableClose: true
        })
    }

    // Inprocess Action
    inprocess(model: any): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.inprocessPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.confirmationService.open({
            title: 'Amendment Inprocess',
            message: 'Are you sure to inprocess this amendment process ?',
            icon: { show: true, name: 'heroicons_outline:check-circle', color: 'primary', }
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.amendmentrequestsService.amendmentInprocess({ id: model.id }).subscribe({
                    next: (data) => {
                        this.alertService.showToast('success', "Amendment inprocessed!", "top-right", true);
                        this.refreshItems();
                    }, error: (err) => {
                        this.alertService.showToast("error", err);
                    },
                })
            }
        })
    }

    // Refund Initiate Action
    refundInitiate(model: any): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.refundInitiatePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.confirmationService.open({
            title: 'Amendment Refund Initiate',
            message: 'Are you sure to refund initiate this amendment process ?',
            icon: { show: true, name: 'heroicons_outline:check-circle', color: 'primary', }
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.amendmentrequestsService.amendmentRefundInitiate({ id: model.id }).subscribe({
                    next: (data) => {
                        this.alertService.showToast('success', "Amendment refund initiated!", "top-right", true);
                        this.refreshItems();
                    }, error: (err) => {
                        this.alertService.showToast("error", err);
                    },
                })
            }
        })
    }

    // Complete Action
    complete(model: any): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.completePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.confirmationService.open({
            title: 'Amendment Complete',
            message: 'Are you sure to complete this amendment process ?',
            icon: { show: true, name: 'heroicons_outline:check-circle', color: 'primary', }
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.amendmentrequestsService.completeAmendment(model.id).subscribe({
                    next: () => {
                        this.alertService.showToast('success', "Amendment completed!", "top-right", true);
                        this.refreshItems();
                    }, error: (err) => {
                        this.alertService.showToast("error", err);
                    },
                })
            }
        })
    }

    // Info Drawer Action
    viewInternal(record: any): void {
        // AmendmentRequestEntryComponent
        this.entityService.raiseAmendmentInfoCall({ data: record });
    }

    // No Data Text
    getNodataText(): string {
        if (this.isLoading) return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    // Export Excel
    exportExcel(): void {
        if (!Security.hasExportDataPermission(this.module_name)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // const filterReq = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value);
        // const req = Object.assign(filterReq);

        // req.skip = 0;
        // req.take = this._paginator.length;
        let extraModel = this.getFilter();
        let newModel = this.getNewFilterReq({})
        const filterReq = { ...extraModel, ...newModel };
        filterReq['FromDate'] = DateTime.fromJSDate(this.AmendmentFilter.FromDate).toFormat('yyyy-MM-dd');
        filterReq['ToDate'] = DateTime.fromJSDate(this.AmendmentFilter.ToDate).toFormat('yyyy-MM-dd');
        filterReq['agent_id'] = this.AmendmentFilter?.agent_id?.id || '';
        filterReq['supplier_id'] = this.AmendmentFilter?.supplier_id?.id || '';
        filterReq['status'] = this.AmendmentFilter?.status == 'All' ? '' : this.AmendmentFilter?.status;
        filterReq['type'] = this.AmendmentFilter?.type == 'All' ? '' : this.AmendmentFilter?.type;
        filterReq['Take'] = this.totalRecords;

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
                    { header: 'Flight No.', property: 'booking_ref_no' },
                    { header: 'PNR', property: 'pnr' },
                    { header: 'GDS PNR', property: 'gds_pnr' },
                    { header: 'Request On', property: 'amendment_request_time' },
                    { header: 'Travel Date', property: 'travel_date' },
                    { header: 'Agent Status', property: 'status_for_agent' },
                    { header: 'Confirmed', property: 'amendment_confirmation_time' },
                ],
                data.data, "Amendment Booking", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 12 } }]);
        });
    }
}
