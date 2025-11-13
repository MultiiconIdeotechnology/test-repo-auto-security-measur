import { NgIf, NgFor, DatePipe, CommonModule, NgClass } from '@angular/common';
import { Component, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import {
    Security,
    filter_module_name,
    messages,
    module_name,
    saleProductPermissions,
} from 'app/security';
import { AccountService } from 'app/services/account.service';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { TimelineAgentProductInfoComponent } from 'app/modules/crm/timeline/product-info/product-info.component';
import { Linq } from 'app/utils/linq';
import { Routes } from 'app/common/const';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentProductInfoComponent } from 'app/modules/crm/agent/product-info/product-info.component';
import { AgentService } from 'app/services/agent.service';
import { Subscription, takeUntil } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { ProductTabComponent } from '../product-tab.component';
import { RefferralService } from 'app/services/referral.service';
import { UserService } from 'app/core/user/user.service';
import { OverlayPanel } from 'primeng/overlaypanel';
import { cloneDeep } from 'lodash';

@Component({
    selector: 'app-product-receipts',
    standalone: true,
    templateUrl: './product-receipts.component.html',
    imports: [
        NgIf,
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
        MatProgressSpinnerModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        NgxMatSelectSearchModule,
        MatTabsModule,
        PrimeNgImportsModule
    ],
})

export class ProductReceiptsComponent extends BaseListingComponent implements OnDestroy {
    @Input() isFilterShow: boolean = false;
    @Output() isFilterShowEvent = new EventEmitter(false);
    @ViewChild('op') overlayPanel!: OverlayPanel;
    module_name = module_name.products_receipts;
    filter_table_name = filter_module_name.products_receipts;
    private settingsUpdatedSubscription: Subscription;
    isLoading = false;
    dataList = [];
    total_amount: any = 0;
    total_actual_amount: any = 0;
    finalAmountTotal: number = 0;
    selectedAgent: any;
    agentList: any[] = [];
    selectedRM: any;
    employeeList: any = [];
    user: any = {};

    index = {
        payment_amount: -1,
        actual_amount: -1,
        final_amount:-1

    };
    types = Types;
    selectedColumns: Column[] = [];
    exportCol: Column[] = [];
    activeFiltData: any = {};
    cols: Column[] = [];

    statusList: any[] = [
        { label: 'Confirmed', value: 'Confirmed' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Rejected', value: 'Rejected' },
    ];

    constructor(
        private accountService: AccountService,
        private agentService: AgentService,
        private matDialog: MatDialog,
        private _userService: UserService,
        public _filterService: CommonFilterService,
        private refferralService: RefferralService,
    ) {
        super(module_name.products_receipts);

        this.sortColumn = 'receipt_request_date';
        this.sortDirection = 'desc';
        this._filterService.applyDefaultFilter(this.filter_table_name);

        //user login
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: any) => {
                this.user = user;
            });
        this.selectedColumns = [

            { field: 'receipt_ref_no', header: 'Reference No.', type: Types.text },
            { field: 'agent_Code', header: 'Agent Code', type: Types.number, fixVal: 0 },
            { field: 'agent_name', header: 'Agent', type: Types.select },
            { field: 'campaign_code', header: 'Campaign Code', type: Types.text },
            { field: 'rm_name', header: 'RM', type: Types.select },
            { field: 'product_name', header: 'Product name', type: Types.link },
            { field: 'payment_amount', header: 'Amount', type: Types.number, fixVal: 2, class: 'text-right' },
            { field: 'actual_amount', header: 'Without Tax', type: Types.number, fixVal: 2, class: 'text-right' }, 
            { field: 'final_amount', header: 'With Tax', type: Types.number, fixVal: 2, class: 'text-right' },
            { field: 'receipt_status', header: 'Status', type: Types.select, isCustomColor: true },
            { field: 'audit_date_time', header: 'Date', type: Types.dateTime, dateFormat: 'dd-MM-yyyy' },
        ];

        this.cols.unshift(...this.selectedColumns);
        this.exportCol = cloneDeep(this.cols);
    }

    ngOnInit(): void {
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            if (resp['gridName'] != this.filter_table_name) return;
            this.activeFiltData = resp;
            this.sortColumn = resp['sortColumn'];
            //this.selectDateRanges(resp['table_config']);
            this.primengTable['_sortField'] = resp['sortColumn'];
            this.isFilterShow = true;
            this.primengTable['filters'] = resp['table_config'];
            this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns);
            this.primengTable._filter();
        });


        this.agentList = this._filterService.agentListByValue;
        this.employeeList = this._filterService.rmListByValue;

        // common filter
        this._filterService.updateSelectedOption('');
        this.startSubscription();
    }

    ngAfterViewInit() {
        // Defult Active filter show
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShow = true;
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            this.selectedAgent = filterData['table_config']['agent_name']?.value;
            this.selectedRM = filterData['table_config']['rm']?.value;
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }

            if (filterData['table_config']['audit_date_time']?.value && Array.isArray(filterData['table_config']['audit_date_time']?.value)) {
                this._filterService.selectionDateDropdown = 'custom_date_range';
                this._filterService.rangeDateConvert(filterData['table_config']['audit_date_time']);
            }
            this.isFilterShowEvent.emit(true);
            this.primengTable['filters'] = filterData['table_config'];
            this.selectedColumns = this.checkSelectedColumn(filterData['selectedColumns'] || [], this.selectedColumns);
            this.onColumnsChange();
        } else {
            this.selectedColumns = this.checkSelectedColumn([], this.selectedColumns);
            this.onColumnsChange();
        }

        this.getColIndex();
    }
    getColIndex(): void { //  add new
        this.index.payment_amount = this.selectedColumns.findIndex((item: any) => item.field == 'payment_amount');
        this.index.actual_amount = this.selectedColumns.findIndex((item: any) => item.field == 'actual_amount');
        this.index.final_amount = this.selectedColumns.findIndex((item: any) => item.field == 'final_amount');
    }

    isAnyIndexMatch(): boolean { //  add new
        const len = this.selectedColumns?.length - 1;
        return len == this.index.payment_amount || len == this.index.actual_amount  || len == this.index.final_amount;
    }

    isDisplayFooter(): boolean { //  add new
        return this.selectedColumns.some(x => x.field == 'payment_amount' || x.field == 'actual_amount' || x.field == 'final_amount');
    }

    isNotDisplay(field: string): boolean { //  add new
        return field != "payment_amount" && field != "actual_amount" && field != "final_amount"
    }


    onColumnsChange(): void {
        this._filterService.setSelectedColumns({ name: this.filter_table_name, columns: this.selectedColumns });
    }

    checkSelectedColumn(col: any[], oldCol: Column[]): any[] {
        if (col.length) return col
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


    toggleOverlayPanel(event: MouseEvent) {
        this.overlayPanel.toggle(event);
    }

    // function to get the Agent list from api
    getAgent(value: string) {
        this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
            this.agentList = data;

            for (let i in this.agentList) {
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`;
                this.agentList[i].id_by_value = this.agentList[i].agency_name;
            }
        })
    }

    // Api to get the Employee list data
    getEmployeeList(value: string) {
        this.refferralService.getEmployeeLeadAssignCombo(value).subscribe((data: any) => {
            this.employeeList = data;

            for (let i in this.employeeList) {
                this.employeeList[i].id_by_value = this.employeeList[i].employee_name;
            }
        });
    }

    product(record: any): void {
        this.matDialog.open(TimelineAgentProductInfoComponent, {
            data: {
                data: record,
                agencyName: record?.agent_name,
                readonly: true,
                account_receipt: true,
            },
            disableClose: true,
        });
    }

    getStatusIndicatorClass(status: string): string {
        if (status == 'Pending') {
            return 'text-yellow-600';
        } else if (status == 'Audited') {
            return 'text-green-600';
        } else if (status == 'Rejected') {
            return 'text-red-600';
        } else if (status == 'Confirmed') {
            return 'text-green-600';
        } else {
            return 'text-blue-600';
        }
    }

    viewData(record: any): void {
        // if (!Security.hasViewDetailPermission(module_name.bookingsFlight)) {
        //     return this.alertService.showToast(
        //         'error',
        //         messages.permissionDenied
        //     );
        // }

        if (record?.transaction_ref_no?.substring(0, 3) == 'FLT') {
            Linq.recirect('/booking/flight/details/' + record.product_id);
        }
        else if (record?.transaction_ref_no?.substring(0, 3) == 'VIS') {
            Linq.recirect('/booking/visa/details/' + record.product_id);
        }
        else if (record?.transaction_ref_no?.substring(0, 3) == 'BUS') {
            Linq.recirect('/booking/bus/details/' + record.product_id);
        }
        else if (record?.transaction_ref_no?.substring(0, 3) == 'HTL') {
            Linq.recirect('/booking/hotel/details/' + record.product_id);
        }
        else if (record?.transaction_ref_no?.substring(0, 3) == 'AGI') {
            Linq.recirect('/booking/group-inquiry/details/' + record.product_id);
        }
        else if (record?.service_for == 'Product Purchase') {
            this.matDialog.open(AgentProductInfoComponent, {
                data: {
                    data: record,
                    agencyName: record?.agent_name,
                    readonly: true,
                    account_receipt: true,
                },
                disableClose: true,
            });
        }
        else if (record?.transaction_ref_no?.substring(0, 3) == 'OSB') {
            Linq.recirect('/booking/offline-service/entry/' + record.product_id + '/readonly');
        }

    }

    viewAgentData(data: any): void {
        Linq.recirect([Routes.customers.agent_entry_route + '/' + data.agent_id + '/readonly']);
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        let extraModel = {
            service_for: "Product Purchase"
        };
        let newModel = this.getNewFilterReq(event);
        let model = { ...extraModel, ...newModel }
        if (Security.hasPermission(saleProductPermissions.viewOnlyAssignedPermissions)) {
            model.relationmanagerId = this.user.id
        }

        this.accountService.getReceiptList(model).subscribe({
            next: (data) => {
                this.dataList = data.data;
                this.totalRecords = data?.total;
                this.total_amount = data?.total_amount || 0;
                this.total_actual_amount = data?.total_actual_amount || 0;
                this.finalAmountTotal = data?.finalAmountTotal || 0;
                this.isLoading = false;
                if (this.dataList && this.dataList.length) {
                    setTimeout(() => {
                        this.isFrozenColumn('', ['receipt_ref_no']);
                    }, 200);
                }
            },
            error: (err) => {
                this.alertService.showToast('error', err);
                this.isLoading = false;
            },
        });
    }

    exportExcel(): void {
        if (!Security.hasExportDataPermission(this.module_name)) {
            return this.alertService.showToast(
                'error',
                messages.permissionDenied
            );
        }

        const filterReq = this.getNewFilterReq({});

        filterReq['Filter'] = this.searchInputControl.value;
        filterReq['Take'] = this.totalRecords;
        filterReq['service_for'] = "Product Purchase";

        this.accountService.getReceiptList(filterReq).subscribe((data) => {
            for (var dt of data.data) {
                dt.audit_date_time = dt.audit_date_time ? DateTime.fromISO(dt.audit_date_time).toFormat('dd-MM-yyyy') : '';
            }
            ['receipt_ref_no', 'agent_Code', 'agent_name', 'campaign_code', 'rm_name', 'product_name', 'payment_amount', 'receipt_status', 'audit_date_time']
            Excel.export(
                'Receipt',
                [
                    { header: 'Reference No.', property: 'receipt_ref_no' },
                    { header: 'Agent Code', property: 'agent_Code' },
                    { header: 'Agent', property: 'agent_name' },
                    { header: 'Campaign_code', property: 'campaign_code' },
                    { header: 'RM', property: 'rm_name' },
                    { header: 'Product name', property: 'product_name' },
                    { header: 'Amount', property: 'payment_amount' },
                    { header: 'Actual Amount', property: 'actual_amount' },
                    { header: 'Final Amount', property: 'final_amount' },
                    { header: 'Status', property: 'receipt_status' },
                    { header: 'Date', property: 'audit_date_time' },
                ],
                data.data,
                'Receipt',
                [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }]
            );
        });
    }

    getNodataText(): string {
        if (this.isLoading) return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    startSubscription() {
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
            this._filterService.updateSelectedOption('');
            this.selectedAgent = resp['table_config']['agent_name']?.value;
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }
            this.selectedRM = resp['table_config']['rm']?.value;

            if (resp['table_config']['receipt_request_date']?.value && Array.isArray(resp['table_config']['receipt_request_date']?.value)) {
                this._filterService.selectionDateDropdown = 'custom_date_range';
                this._filterService.rangeDateConvert(resp['table_config']['receipt_request_date']);
            }

            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShow = true;
            this.primengTable._filter();
        });
    }

    stopSubscription() {
        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this.settingsUpdatedSubscription = undefined;
        }
    }

    ngOnDestroy(): void {
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