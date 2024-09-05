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
        MultiSelectModule
    ],
})
export class AmendmentRequestsListComponent
    extends BaseListingComponent
    implements OnDestroy {
    isFilterShow: boolean = false;
    module_name = module_name.amendmentRequests;
    filter_table_name = filter_module_name.amendment_requests_booking;
    private settingsUpdatedSubscription: Subscription;
    dataList = [];
    total = 0;

    AmendmentFilter: any
    cols = [];
    selectedAgent:any
    selectedSupplier:any;
    selectedStatus:any;
    agentList: any[] = [];
    supplierList: any[] = [];
    isMenuOpen: boolean = false;
    selectionDateDropdown:any;

    // statusList = [ 'Pending', 'Inprocess', 'Cancelled','Confirm', 'Rejected', 'Completed', 'Quotation Sent','Partial Cancellation Pending', 'Account Audit', 'Expired'];
     statusList = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Inprocess', value: 'Inprocess' },
        { label: 'Cancelled', value: 'Cancelled' },
        { label: 'Confirm', value: 'Confirm' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Quotation Sent', value: 'Quotation Sent' },
        { label: 'Partial Cancellation Pending', value: 'Partial Cancellation Pending' },
        { label: 'Account Audit', value: 'Account Audit' },
        { label: 'Expired', value: 'Expired' }
    ];
    
    typeList = [ 'Cancellation Quotation', 'Instant Cancellation', 'Full Refund', 'Reissue Quotation', 'Miscellaneous', 'No Show', 'Void', 'Correction Quotation', 'Wheel Chair', 'Meal Quotation(SSR)', 'Baggage Quotation(SSR)'];

    constructor(
        private amendmentrequestsService: AmendmentRequestsService,
        private matDialog: MatDialog,
        private toasterService: ToasterService,
        private agentService: AgentService,
        private kycDocumentService: KycDocumentService,
        private confirmationService: FuseConfirmationService,
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

    }

    ngOnInit() {
        this.isMenuOpen = Security.hasPermission(amendmentRequestsPermissions.manuDisplayPermissions);
        this.getAgent("", true);
        this.getSupplier("", true);

        // common filter
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
            this.selectionDateDropdown = '';
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
                this.selectionDateDropdown = 'Custom Date Range';
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
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
            if (filterData?.['table_config']?.['amendment_request_time']?.value != null && filterData['table_config']['amendment_request_time'].value.length) {
                this.selectionDateDropdown = 'Custom Date Range';
                this._filterService.rangeDateConvert(filterData['table_config']['amendment_request_time']);
            }

            if (filterData['table_config']['travel_date']?.value != null) {
              filterData['table_config']['travel_date'].value = new Date(filterData['table_config']['travel_date'].value);
            }
            this.primengTable['filters'] = filterData['table_config'];
        }
    }

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

    getAgent(value: string, bool: boolean = true) {
        this.agentService.getAgentComboMaster(value, bool).subscribe((data) => {
            this.agentList = data;

            if(this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                  this.agentList.push(this.selectedAgent);
                }
            }

            for(let i in this.agentList){
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`
            }
        });
    }

    getSupplier(value: string, bool: boolean = true) {
        this.kycDocumentService.getSupplierCombo(value, 'Airline').subscribe((data) => {
            this.supplierList = data;

            for(let i in this.supplierList){
               this.supplierList[i].id_by_value = this.supplierList[i].company_name;
            }
        });
    }

    onOptionClick(option: any) {
        this.selectionDateDropdown = option.value;
        const today = new Date();
        let startDate = new Date(today);
        let endDate = new Date(today);

        switch (option.label) {
            case 'Today':
                break;
            case 'Last 3 Days':
                startDate.setDate(today.getDate() - 2);
                break;
            case 'This Week':
                startDate.setDate(today.getDate() - today.getDay());
                break;
            case 'This Month':
                startDate.setDate(1);
                break;
            case 'Last 3 Months':
                startDate.setMonth(today.getMonth() - 3);
                startDate.setDate(1);
                break;
            case 'Last 6 Months':
                startDate.setMonth(today.getMonth() - 6);
                startDate.setDate(1);
                break;
            case 'Custom Date Range':
           
            default:
                return;
        }
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        let dateArr = [startDate, endDate];
        const range = [startDate.toISOString(), endDate.toISOString()].join(",");
        this.primengTable.filter(range, 'amendment_request_time', 'custom');
        this.primengTable.filters['amendment_request_time']['value'] = dateArr;
        this.primengTable.filters['amendment_request_time']['matchMode'] = 'custom';
    }
    
    onDateRangeCancel() {
        this.selectionDateDropdown = ''
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        let extraModel = this.getFilter();
        let newModel = this.getNewFilterReq(event)
        var model = { ...extraModel, ...newModel };

        this.amendmentrequestsService
            .getAirAmendmentList(model)
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
                    this.totalRecords = data.total;
                    if (this.dataList && this.dataList.length) {
                        setTimeout(() => {
                          this.isFrozenColumn('', ['reference_no']);
                        }, 200);
                    }
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

    // complete(model): void {
    //     const amendment = {}
    //     amendment['agent_id'] = model.agent_id;
    //     amendment['amendment_id'] = model.id;
    //     amendment['payment_method'] = 'Wallet';
    //     this.confirmationService.open({
    //         title: 'Amendment process',
    //         message: 'Are you sure to complete this amendment process ?',
    //         icon: { show: true, name: 'heroicons_outline:check-circle', color: 'primary', }
    //     }).afterClosed().subscribe(res => {
    //         if (res === 'confirmed') {
    //             this.amendmentrequestsService.amendmentChargesDeduction(amendment).subscribe(() => {
    //                 this.alertService.showToast('success', "Amendment process completed!", "top-right", true);
    //                 this.refreshItems();
    //             })
    //         }
    //     })
    // }

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
        if (status == 'Pending' || status == 'Inprocess' || status == 'Partial Cancellation Pending' || status =='Request Sent to Supplier' || status == 'Cancellation Pending') {
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

    inprocess(model): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.inprocessPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.confirmationService.open({
            title: 'Amendment Inprocess',
            message: 'Are you sure to inprocess this amendment process ?',
            icon: { show: true, name: 'heroicons_outline:check-circle', color: 'primary', }
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.amendmentrequestsService.amendmentInprocess({id: model.id}).subscribe(() => {
                    this.alertService.showToast('success', "Amendment inprocessed!", "top-right", true);
                    this.refreshItems();
                })
            }
        })
    }

    refundInitiate(model): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.refundInitiatePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.confirmationService.open({
            title: 'Amendment Refund Initiate',
            message: 'Are you sure to refund initiate this amendment process ?',
            icon: { show: true, name: 'heroicons_outline:check-circle', color: 'primary', }
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.amendmentrequestsService.amendmentRefundInitiate({id: model.id}).subscribe(() => {
                    this.alertService.showToast('success', "Amendment refund initiated!", "top-right", true);
                    this.refreshItems();
                })
            }
        })
    }

    complete(model): void {
        if (!Security.hasPermission(amendmentRequestsPermissions.completePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.confirmationService.open({
            title: 'Amendment Complete',
            message: 'Are you sure to complete this amendment process ?',
            icon: { show: true, name: 'heroicons_outline:check-circle', color: 'primary', }
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.amendmentrequestsService.completeAmendment(model.id).subscribe(() => {
                    this.alertService.showToast('success', "Amendment completed!", "top-right", true);
                    this.refreshItems();
                })
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
                dt.amendment_request_time = dt.amendment_request_time ? DateTime.fromISO(dt.amendment_request_time).toFormat('dd-MM-yyyy HH:mm:ss') : '';
                dt.travel_date = dt.travel_date ? DateTime.fromISO(dt.travel_date).toFormat('dd-MM-yyyy HH:mm:ss') : '';
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
