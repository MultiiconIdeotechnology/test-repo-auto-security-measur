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
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { Security, amendmentRequestsPermissions, filter_module_name, messages, module_name } from 'app/security';
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
import { Linq } from 'app/utils/linq';
import { StatusInfoComponent } from './status-info/status-info.component';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { MultiSelectModule } from 'primeng/multiselect';

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
        AmendmentRequestEntryComponent,
        StatusInfoComponent,
        MultiSelectModule
    ],
})
export class AmendmentRequestsListComponent
    extends BaseListingComponent {
    isFilterShow: boolean = false;
    module_name = module_name.amendmentRequests;
    filter_table_name = filter_module_name.amendment_requests_booking;
    private settingsUpdatedSubscription: Subscription;
    dataList = [];
    total = 0;

    AmendmentFilter: any;
    _selectedColumns: Column[];
    cols = [];
    selectedAgent:any
    selectedSupplier:any;
    selectedStatus:any;
    agentList: any[] = [];
    supplierList: any[] = [];

    isMenuOpen: boolean = false;

    typeList = ['Cancellation Quotation', 'Instant Cancellation', 'Full Refund', 'Reissue Quotation', 'Miscellaneous', 'No Show', 'Void', 'Correction Quotation', 'Wheel Chair', 'Meal Quotation(SSR)', 'Baggage Quotation(SSR)'];
    statusList = [
       { label:  "Request Sent to Supplier", value: 'Request Sent to Supplier' },
       { label:  "Request to Supplier Failed", value: 'Request to Supplier Failed' },
       { label:  "Quotation Sent", value: 'Quotation Sent' },
       { label:  "Quotation Confirmed By TA", value: 'Quotation Confirmed By TA' },
       { label:  "Quotation Rejected By TA", value: 'Quotation Rejected By TA' },
       { label:  "Confirmation Sent To Supplier", value: 'Confirmation Sent To Supplier' },
       { label:  "Payment Completed", value: 'Payment Completed' },
       { label:  "Refund Process", value: 'Refund Process' },
       { label:  "Refund Completed", value: 'Refund Completed' },
       { label:  "Completed", value: 'Completed' },
       { label:  "Rejected", value: 'Rejected' },
       { label:  "Cancelled", value: 'Cancelled' },
       { label:  "Partial Payment Completed", value: 'Partial Payment Completed' },
       { label:  "Account Rejected", value: 'Account Rejected' },
       { label:  "Account Audit" , value: 'Account Audit' }
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
        private entityService: EntityService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.amendmentRequests);
        this.key = this.module_name;
        this.sortColumn = 'amendment_request_time';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);

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
                if (item) {
                    this.refreshItems();
                }
            }
        });
    }

    ngOnInit() {

        this.cols = [
            { field: 'gds_pnr', header: 'GDS PNR' },
            { field: 'travel_date', header: 'Travel Date' },
            { field: 'status_for_agent', header: 'Agent Status' },
            { field: 'reject_reason', header: 'Reject Reason' },
            { field: 'amendment_confirmation_time', header: 'Confirmed' },
            { field: 'sup_refund_amount', header: 'Supplier Refund Amount' },
            { field: 'sup_refund_date', header: 'Supplier Refund Date' },
        ];

        this.getAgent("", true);
        this.getSupplier("");
        this.agentList = this._filterService.agentListById;
        // this.getSupplier("");

    }

    get selectedColumns(): Column[] {
        return this._selectedColumns;
        // common filter
        this._filterService.selectionDateDropdown = "";
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
            this._filterService.selectionDateDropdown = "";
            this.selectedAgent = resp['table_config']['agent_id_filters']?.value;
            if(this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                  this.agentList.push(this.selectedAgent);
                }
            }

            this.selectedSupplier = resp['table_config']['company_name']?.value;
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];

            if (resp?.['table_config']?.['amendment_request_time']?.value != null && resp['table_config']['amendment_request_time'].value.length) {
                this._filterService.selectionDateDropdown = 'Custom Date Range';
                this._filterService.rangeDateConvert(resp['table_config']['amendment_request_time']);
            }

            if (resp['table_config']['travel_date']?.value != null) {
              resp['table_config']['travel_date'].value = new Date(resp['table_config']['travel_date'].value);
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
            this.selectedSupplier = filterData['table_config']['company_name']?.value;
            if(this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                  this.agentList.push(this.selectedAgent);
                }
            }
            if (filterData?.['table_config']?.['amendment_request_time']?.value != null && filterData['table_config']['amendment_request_time'].value.length) {
                this._filterService.selectionDateDropdown = 'Custom Date Range';
                this._filterService.rangeDateConvert(filterData['table_config']['amendment_request_time']);
            }

            if (filterData['table_config']['travel_date']?.value != null) {
              filterData['table_config']['travel_date'].value = new Date(filterData['table_config']['travel_date'].value);
            }
            this.primengTable['filters'] = filterData['table_config'];
        }
    }

    set selectedColumns(val: Column[]) {
        this._selectedColumns = this.cols.filter((col) => val.includes(col));
    }

    // Get Filter
    getFilter(): any {
        const filterReq = GridUtils.GetFilterReq(
            this._paginator,
            this._sort,
            this.searchInputControl.value
        );

        filterReq['FromDate'] = '';
        filterReq['ToDate'] = '';
        // filterReq['FromDate'] = DateTime.fromJSDate(this.AmendmentFilter.FromDate).toFormat('yyyy-MM-dd');
        // filterReq['ToDate'] = DateTime.fromJSDate(this.AmendmentFilter.ToDate).toFormat('yyyy-MM-dd');
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
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`
            }
        });
    }

    getSupplier(value: string) {
        this.kycDocumentService.getSupplierCombo(value, 'Airline').subscribe((data) => {
            this.supplierList = data;

            for(let i in this.supplierList){
               this.supplierList[i].id_by_value = this.supplierList[i].company_name;
            }
        });
    }

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

    // Navigate To Flight Details
    viewData(record: any): void {
        if (!Security.hasViewDetailPermission(module_name.bookingsFlight)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        Linq.recirect('/booking/flight/details/' + record.air_booking_id);
    }

    // Status wise color
    getStatusColor(status: string): string {
        if (status == 'Refund Process' || status == 'Inprocess' || status == 'Account Audit' || status == 'Partial Cancellation Pending' || status == 'Cancellation Pending') {
            return 'text-orange-600';
        } else if (status == 'Quotation Sent' || status == "Partial Payment Completed") {
            return 'text-yellow-600';
        } else if (status == 'Quotation Confirmed By TA' || status == 'Completed' || status == 'Confirm' || status == 'Quotation Confirmed') {
            return 'text-green-600';
        } else if (status == 'Request to Supplier Failed' || status == "Quotation Rejected By TA" || status == "Rejected" || status == "Cancelled" || status == "Account Rejected") {
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

    statusInfo(){
        this.entityService.raiseAmendmentStatusInfoCall(null);
    }

    // Show update charge
    showUpdateCharge(data: any): boolean {
        return (data.amendment_status?.toLowerCase() == 'request sent to supplier' || data.amendment_status?.toLowerCase() == 'quotation sent' || data.amendment_status?.toLowerCase() == 'quotation confirmed by ta');
    }

    // Update Charge Drawer Action
    updateCharge(model: any): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.updateChargePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // UpdateChargeComponent
        this.entityService.raiseUpdateChargeCall({ data: model });
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
                dt.amendment_request_time = dt.amendment_request_time ? DateTime.fromISO(dt.amendment_request_time).toFormat('dd-MM-yyyy HH:mm:ss') : '';
                dt.travel_date = dt.travel_date ? DateTime.fromISO(dt.travel_date).toFormat('dd-MM-yyyy HH:mm:ss') : '';
            }
            Excel.export(
                'Amendment Booking',
                [
                    { header: 'Ref No.', property: 'reference_no' },
                    { header: 'Amendment Type', property: 'amendment_type' },
                    { header: 'Status', property: 'amendment_status' },
                    { header: 'Agent', property: 'agency_name' },
                    { header: 'Supplier', property: 'company_name' },
                    { header: 'Booking Ref. No.', property: 'booking_ref_no' },
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

    ngOnDestroy(): void {
        // this.masterService.setData(this.key, this);

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }
}
