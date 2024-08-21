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

@Component({
    selector: 'app-group-inquiry-list',
    templateUrl: './group-inquiry-list.component.html',
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
        PrimeNgImportsModule
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
    selectedAgent:any;
    selectedSupplier:any;
    agentList:any[] = [];
    supplierList:any[]= [];
    statusList = [ 'Pending', 'Inprocess', 'Cancelled','Confirm', 'Rejected', 'Completed', 'Quotation Sent','Partial Cancellation Pending', 'Expired'];
    cols = [];

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
        this.sortColumn = 'departure_date';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit(): void {
        this.getSupplier("");
        this.getAgent("");

        // common filter
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            console.log("resp>>>", resp)
            this.selectedAgent = resp['table_config']['agent_id_filters']?.value;
            if(this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                  this.agentList.push(this.selectedAgent);
                }
            }

            this.selectedSupplier = resp['table_config']['supplier_name']?.value;
            this.sortColumn = resp['sortColumn'];
            this.primengTable['_sortField'] = resp['sortColumn'];
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
            if (filterData['table_config']['departure_date'].value) {
                filterData['table_config']['departure_date'].value = new Date(filterData['table_config']['departure_date'].value);
            }
            if (filterData['table_config']['arrival_date'].value) {
                filterData['table_config']['arrival_date'].value = new Date(filterData['table_config']['arrival_date'].value);
            }
            this.primengTable['filters'] = filterData['table_config'];
            this.primengTable['_sortField'] = filterData['sortColumn'];
            this.sortColumn = filterData['sortColumn'];
        }
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
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`
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

    ngOnDestroy(): void {
        // this.masterService.setData(this.key, this);

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }
}
