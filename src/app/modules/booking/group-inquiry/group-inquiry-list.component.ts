import { CommonModule } from '@angular/common';
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
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { Security, filter_module_name, groupInquiryPermissions, messages, module_name } from 'app/security';
import { MatDialog } from '@angular/material/dialog';
import { GroupInquiryService } from 'app/services/group-inquiry.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { DateTime } from 'luxon';
import { Excel } from 'app/utils/export/excel';
import { UpdateChargeComponent } from './update-charge/update-charge.component';
import { Linq } from 'app/utils/linq';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentService } from 'app/services/agent.service';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { RejectResonComponent } from 'app/modules/account/withdraw/reject-reson/reject-reson.component';
import { cloneDeep } from 'lodash';

@Component({
    selector: 'app-group-inquiry-list',
    templateUrl: './group-inquiry-list.component.html',
    standalone: true,
    imports: [
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
        PrimeNgImportsModule,
        CommonModule
    ],
})
export class GroupInquiryListComponent
    extends BaseListingComponent
    implements OnDestroy {
    isFilterShow: boolean = false;
    module_name = module_name.groupInquiry;
    filter_table_name = filter_module_name.group_inquiry_booking;
    private settingsUpdatedSubscription: Subscription;
    dataList = [];
    total = 0;
    selectedAgent: any;
    selectedSupplier: any;
    agentList: any[] = [];
    supplierList: any[] = [];
    statusList = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Inprocess', value: 'Inprocess' },
        { label: 'Cancelled', value: 'Cancelled' },
        { label: 'Confirm', value: 'Confirm' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Quotation Sent', value: 'Quotation Sent' },
        { label: 'Partial Cancellation Pending', value: 'Partial Cancellation Pending' },
        { label: 'Expired', value: 'Expired' }
    ];

    types = Types;
    cols: Column[] = [];
    selectedColumns: Column[] = [];
    exportCol: Column[] = [];
    activeFiltData: any = {};

    constructor(
        private groupInquiryService: GroupInquiryService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        private agentService: AgentService,
        private kycDocumentService: KycDocumentService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.groupInquiry);
        this.key = this.module_name;
        this.sortColumn = 'entry_date_time';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);

        this.selectedColumns = [
            { field: 'booking_ref_no', header: 'Ref No.', type: Types.link, isFrozen: false, },
            { field: 'agent_name', header: 'Agent', type: Types.select, },
            { field: 'supplier_name', header: 'Supplier', type: Types.select, },
            { field: 'booking_status', header: 'Status', type: Types.select, isFrozen: false, isCustomColor: true },
            { field: 'pnr', header: 'PNR', type: Types.text },
            { field: 'departure_date', header: 'Departure Date', type: Types.date, dateFormat: 'dd-MM-yyyy HH:mm:ss' },
            { field: 'arrival_date', header: 'Arrival Date', type: Types.date, dateFormat: 'dd-MM-yyyy HH:mm:ss' },
            { field: 'entry_date_time', header: 'Entry Date', type: Types.date, dateFormat: 'dd-MM-yyyy HH:mm:ss' },
            { field: 'trip_type', header: 'Trip Type', type: Types.text, },
            { field: 'pax', header: 'Pax', type: Types.text, isHideFilter:true},
            { field: 'reject_reason', header: 'Reject Reason', type: Types.text,isHideFilter:true },
        ];
        this.cols.unshift(...this.selectedColumns);
        this.exportCol = cloneDeep(this.cols);
    }

    ngOnInit(): void {
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.sortColumn = resp['sortColumn'];
            this.primengTable['_sortField'] = resp['sortColumn'];
            this.isFilterShow = true;
            //this.selectDateRanges(resp['table_config']);
            this.primengTable['filters'] = resp['table_config'];
            this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns);
            this.primengTable._filter();
        });

        this.getSupplier("");
        this.agentList = this._filterService.agentListById;

        // common filter
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.selectedAgent = resp['table_config']['agent_id_filters']?.value;
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }

            this.selectedSupplier = resp['table_config']['supplier_name']?.value;
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['departure_date'].value) {
                resp['table_config']['departure_date'].value = new Date(resp['table_config']['departure_date'].value);
            }
            if (resp['table_config']['arrival_date'].value) {
                resp['table_config']['arrival_date'].value = new Date(resp['table_config']['arrival_date'].value);
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
            this.selectedSupplier = filterData['table_config']['supplier_name']?.value;
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }
            if (filterData['table_config']['departure_date'].value) {
                filterData['table_config']['departure_date'].value = new Date(filterData['table_config']['departure_date'].value);
            }
            if (filterData['table_config']['arrival_date'].value) {
                filterData['table_config']['arrival_date'].value = new Date(filterData['table_config']['arrival_date'].value);
            }
            this.primengTable['filters'] = filterData['table_config'];
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
        }

        const filter = this._filterService.getDefaultFilterByGridName({ gridName: this.filter_table_name });
        if (filter && filter?.gridConfiguration) {
            this.activeFiltData = filter;
            this.isFilterShow = true;
            let filterData = JSON.parse(filter.gridConfiguration);
            this.primengTable['filters'] = filterData['table_config'];
            this.primengTable['_sortField'] = filterData['sortColumn'];
            this.sortColumn = filterData['sortColumn'];
            this.selectedColumns = this.checkSelectedColumn(filterData['selectedColumns'] || [], this.selectedColumns);
            this.onColumnsChange();
        } else {
            this.selectedColumns = this.checkSelectedColumn([], this.selectedColumns);
            this.onColumnsChange();
        }
    }

    onColumnsChange(): void {
        this._filterService.setSelectedColumns({ name: this.filter_table_name, columns: this.selectedColumns });
    }

    checkSelectedColumn(col: any[], oldCol: Column[]): any[] {
        if (col.length) return col;
        else {
            var Col = this._filterService.getSelectedColumns({ name: this.filter_table_name })?.columns || [];
            if (!Col.length)
                return oldCol;
            else
                return Col;
        }
    }

    isDisplayHashCol(): boolean {
        return this.selectedColumns.length > 0;
    }

    onSelectedColumnsChange(): void {
        this._filterService.setSelectedColumns({ name: this.filter_table_name, columns: this.selectedColumns });
    }


    refreshItems(event?: any): void {
        this.isLoading = true;
        // var model = GridUtils.GetFilterReq(this._paginator, this.sort, this.searchInputControl.value, 'departure_date', 1);
        const filterReq = this.getNewFilterReq(event);
        this.groupInquiryService.getAirGroupInquiryList(filterReq).subscribe({
            next: (data: any) => {
                this.dataList = data.data;
                this.dataList.forEach(x => {
                    x.pax = 'Adult:' + x.adults + " child:" + x.child + " Infants:" + x.infants;
                });
                this.isLoading = false;
                this.totalRecords = data.total;
                // this._paginator.length = data.total;
            }, error: (err) => {
                this.isLoading = false;
                this.alertService.showToast('error', err);
            },
        })
    }

    getAgent(value: string) {
        this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
            this.agentList = data;

            for (let i in this.agentList) {
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`
            }
        });
    }

    getSupplier(value: string, bool: boolean = true) {
        this.kycDocumentService.getSupplierCombo(value, 'Airline').subscribe((data) => {
            this.supplierList = data;

            for (let i in this.supplierList) {
                this.supplierList[i].id_by_value = this.supplierList[i].company_name;
            }
        });
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

    getFilter(): any {
        const filterReq = GridUtils.GetFilterReq(
            this._paginator,
            this._sort,
            this.searchInputControl.value,
            'departure_date', 1
        );
        return filterReq;
    }

    exportExcel() {
        if (!Security.hasExportDataPermission(this.module_name)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // const filterReq = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value, 'departure_date', 1);
        // const req = Object.assign(filterReq);

        let extraModel = this.getFilter();
        let newModel = this.getNewFilterReq({})
        const request = { ...extraModel, ...newModel };
        request['Skip'] = 0;
        request['Take'] = this.totalRecords;

        this.groupInquiryService.getAirGroupInquiryList(request).subscribe(data => {
            for (var dt of data.data) {
                dt.departure_date = dt.departure_date ? DateTime.fromISO(dt.departure_date).toFormat('dd-MM-yyyy hh:mm a') : '';
                dt.arrival_date = dt.arrival_date ? DateTime.fromISO(dt.arrival_date).toFormat('dd-MM-yyyy hh:mm a') : '';
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

    getNodataText(): string {
        if (this.isLoading) return 'Loading...';
        else if (this.searchInputControl.value)
            return `No search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
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
        this.matDialog.open(RejectResonComponent, {
            data: null,
            disableClose: true,
        }).afterClosed().subscribe({
            next: (res) => {
                if (res && res.reject_reason) {
                    let body = {
                        id: record.id,
                        Status: 'Rejected',
                        reject_reason: res.reject_reason
                    }

                    this.groupInquiryService.setBookingStatus(body).subscribe({
                        next: () => {
                            this.alertService.showToast('success', "Group Inquiry Rejected", "top-right", true);
                            this.refreshItems();
                        }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
                    });
                }
            }
        });

        // const label: string = 'Reject Group Inquiry'
        // this.conformationService.open({
        //     title: label,
        //     message: 'Are you sure to ' + label.toLowerCase() + ' ?'
        // }).afterClosed().subscribe({
        //     next: (res) => {
        //         if (res === 'confirmed') {

        //         }
        //     }
        // })
    }

    ngOnDestroy(): void {
        // this.masterService.setData(this.key, this);

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }


    displayColCount(): number {
        return this.selectedColumns.length + 1;
    }


    isValidDate(value: any): boolean {
        const date = new Date(value);
        return value && !isNaN(date.getTime());
    }
}
