import { Security, filter_module_name, messages, module_name } from 'app/security';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AppConfig } from 'app/config/app-config';
import { AccountService } from 'app/services/account.service';
import { DateTime } from 'luxon';
import { PaymentFilterComponent } from '../payment-filter/payment-filter.component';
import { Linq } from 'app/utils/linq';
import { AgentProductInfoComponent } from 'app/modules/crm/agent/product-info/product-info.component';
import { Excel } from 'app/utils/export/excel';
import { AgentService } from 'app/services/agent.service';
import { PspSettingService } from 'app/services/psp-setting.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { cloneDeep } from 'lodash';

@Component({
    selector: 'app-receipt-register',
    templateUrl: './receipt-register.component.html',
    styles: [],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatProgressBarModule,
        MatMenuModule,
        MatDialogModule,
        MatDividerModule,
        FormsModule,
        PrimeNgImportsModule,
        MatTooltipModule
    ],
})
export class ReceiptRegisterComponent
    extends BaseListingComponent
    implements OnDestroy {
    module_name = module_name.receiptRegister;
    filter_table_name = filter_module_name.receipt_register;
    private settingsUpdatedSubscription: Subscription;
    dataList = [];
    total = 0;
    user: any;
    is_first: any;
    currentFilter: any;
    infoList = [];
    public Filter: any;
    public key: any = 'receipt_request_date';
    appConfig = AppConfig;
    settings: any;
    agentList: any[] = [];
    selectedAgent: any;
    selectedCompany: any;
    dateRangeValue: any = [];

    types = Types;
    cols: Column[] = [];
    selectedColumns: Column[] = [];
    exportCol: Column[] = [];
    activeFiltData: any = {};

    // cols: Column[] = [
    //     { field: 'receipt_ref_no', header: 'Receipt No.' },
    //     { field: 'receipt_request_date', header: 'Date' },
    //     { field: 'agent_Code', header: 'Agent Code' },
    //     { field: 'agent_name', header: 'Agency Name' },
    //     { field: 'service', header: 'Service' },
    //     { field: 'booking_ref_no', header: 'Booking Ref. No.' },
    //     { field: 'pnr', header: 'PNR' },
    //     { field: 'mode_of_payment', header: 'MOP' },
    //     { field: 'currency', header: 'Currency' },
    //     { field: 'wallet_amount', header: 'Wallet Amount' },
    //     { field: 'pg_amount', header: 'PG Amount' },
    //     { field: 'pg_name', header: 'PSP' },
    //     { field: 'pg_payment_ref_no', header: 'PSP Ref. No.' },
    //     { field: 'company', header: 'Company' }
    // ];


    isFilterShow: boolean = false;
    companyList: any[] = [];

    constructor(
        private accountService: AccountService,
        private matDialog: MatDialog,
        private pspsettingService: PspSettingService,
        private agentService: AgentService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.city);
        this.key = this.module_name;
        this.sortColumn = 'receipt_request_date';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);

        this.currentFilter = {
            status: '',
            payment_gateway: 'All',
            fromDate: new Date(),
            toDate: new Date(),
        };
        this.currentFilter.fromDate.setDate(1);
        this.currentFilter.fromDate.setMonth(
            this.currentFilter.fromDate.getMonth()
        );

        this.selectedColumns = [
            { field: 'receipt_ref_no', header: 'Receipt No.', type: Types.text },
            { field: 'receipt_request_date', header: 'Date', type: Types.dateTime, dateFormat: 'dd-MM-yyyy' },
            { field: 'agent_Code', header: 'Agent Code', type: Types.number, fixVal: 0 },
            { field: 'agent_name', header: 'Agency Name', type: Types.select },
            { field: 'service', header: 'Service', type: Types.text },
            { field: 'booking_ref_no', header: 'Booking Ref. No.', type: Types.link },
            { field: 'pnr', header: 'PNR', type: Types.text },
            { field: 'mode_of_payment', header: 'MOP', type: Types.text },
            { field: 'currency', header: 'Currency', type: Types.text },
            { field: 'wallet_amount', header: 'Wallet Amount', type: Types.number, fixVal: 2, class: 'text-right' },
            { field: 'pg_amount', header: 'PG Amount', type: Types.number, fixVal: 2, class: 'text-right' },
            { field: 'pg_name', header: 'PSP', type: Types.text },
            { field: 'pg_payment_ref_no', header: 'PSP Ref. No.', type: Types.text },
            { field: 'company', header: 'Company', type: Types.select }
        ];
        this.cols.unshift(...this.selectedColumns);
        this.exportCol = cloneDeep(this.cols);
    }

    ngOnInit() {
        this.currentFilter = {
            status: '',
            payment_gateway: 'All',
            fromDate: new Date(),
            toDate: new Date(),
        };
        this.currentFilter.fromDate.setDate(1);
        this.currentFilter.fromDate.setMonth(
            this.currentFilter.fromDate.getMonth()
        );

        this.agentList = this._filterService.agentListByValue;
        this.getCompanyList("");

        // common filter
        this._filterService.updateSelectedOption('');
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
            this._filterService.updateSelectedOption('');
            this.selectedAgent = resp['table_config']['agent_name']?.value;
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }

            this.selectedCompany = resp['table_config']['company']?.value;
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['receipt_request_date']?.value && Array.isArray(resp['table_config']['receipt_request_date']?.value)) {
                this._filterService.selectionDateDropdown = 'custom_date_range';
                this._filterService.rangeDateConvert(resp['table_config']['receipt_request_date']);
            }
            this.primengTable['filters'] = resp['table_config'];
            this.selectedColumns = resp['selectedColumns'] || [];
            this.isFilterShow = true;
            this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns);
            this.primengTable._filter();
        });
    }

    ngAfterViewInit() {
        // Defult Active filter show
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            this.selectedAgent = filterData['table_config']['agent_name']?.value;
            this.selectedCompany = filterData['table_config']['company']?.value;
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }
            if (filterData['table_config']['receipt_request_date']?.value && Array.isArray(filterData['table_config']['receipt_request_date']?.value)) {
                this._filterService.selectionDateDropdown = 'custom_date_range';
                this._filterService.rangeDateConvert(filterData['table_config']['receipt_request_date']);
            }
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
            this.primengTable['filters'] = filterData['table_config'];
            // this.selectedColumns = filterData['selectedColumns'] || [];
            this.isFilterShow = true;
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


    getCompanyList(value) {
        this.pspsettingService.getCompanyCombo(value).subscribe((data) => {
            this.companyList = data;

            for (let i in this.companyList) {
                this.companyList[i].id_by_value = this.companyList[i].company_name;
            }
        })
    }

    getAgent(value: string) {
        this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
            this.agentList = data;

            for (let i in this.agentList) {
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`;
                this.agentList[i].id_by_value = this.agentList[i].agency_name;
            }
        })
    }

    viewData(record): void {
        // if (!Security.hasViewDetailPermission(module_name.bookingsFlight)) {
        //     return this.alertService.showToast(
        //         'error',
        //         messages.permissionDenied
        //     );
        // }

        if (record?.booking_ref_no?.substring(0, 3) == 'FLT') {
            Linq.recirect('/booking/flight/details/' + record.purchase_id);
        }
        else if (record?.booking_ref_no?.substring(0, 3) == 'VIS') {
            Linq.recirect('/booking/visa/details/' + record.purchase_id);
        }
        else if (record?.booking_ref_no?.substring(0, 3) == 'BUS') {
            Linq.recirect('/booking/bus/details/' + record.purchase_id);
        }
        else if (record?.booking_ref_no?.substring(0, 3) == 'HTL') {
            Linq.recirect('/booking/hotel/details/' + record.purchase_id);
        }
        else if (record?.booking_ref_no?.substring(0, 3) == 'AGI') {
            Linq.recirect('/booking/group-inquiry/details/' + record.purchase_id);
        }
        else if (record?.booking_ref_no?.substring(0, 3) == 'PUR') {
            this.matDialog.open(AgentProductInfoComponent, {
                data: {
                    data: record,
                    agencyName: record?.data?.agent_name,
                    readonly: true,
                    receipt_register: true
                },
                disableClose: true,
            });
        }
        else if (record?.booking_ref_no?.substring(0, 3) == 'OSB') {
            Linq.recirect('/booking/offline-service/entry/' + record.purchase_id + '/readonly');
        }
    }

    exportExcel(): void {
        if (!Security.hasExportDataPermission(this.module_name)) {
            return this.alertService.showToast(
                'error',
                messages.permissionDenied
            );
        }

        const filterReq = this.getNewFilterReq({})
        filterReq['Filter'] = this.searchInputControl.value;
        // filterReq['status'] = this.currentFilter.status;
        filterReq['fromDate'] = DateTime.fromJSDate(
            this.currentFilter.fromDate
        ).toFormat('yyyy-MM-dd');
        filterReq['toDate'] = DateTime.fromJSDate(
            this.currentFilter.toDate
        ).toFormat('yyyy-MM-dd');
        filterReq['payment_gateway'] = 'All';
        filterReq['Take'] = this.totalRecords;
        // filterReq['OrderBy'] = 'receipt_request_date';

        this.accountService.getReceiptRegister(filterReq).subscribe((data) => {
            for (var dt of data.data) {
                dt.receipt_request_date = dt.receipt_request_date ? DateTime.fromISO(dt.receipt_request_date).toFormat('dd-MM-yyyy hh:mm a') : '';
            }
            Excel.export(
                'Receipt Register',
                [
                    { header: 'Receipt No.', property: 'receipt_ref_no' },
                    { header: 'Date', property: 'receipt_request_date' },
                    { header: 'Agent Code', property: 'agent_Code' },
                    { header: 'Agency Name', property: 'agent_name' },
                    { header: 'Service', property: 'service' },
                    { header: 'Booking Ref. No.', property: 'booking_ref_no' },
                    { header: 'PNR', property: 'pnr' },
                    { header: 'MOP', property: 'mode_of_payment' },
                    { header: 'Currency', property: 'currency' },
                    { header: 'Wallet Amount', property: 'wallet_amount' },
                    { header: 'PG Amount ', property: 'pg_amount' },
                    { header: 'PSP', property: 'pg_name' },
                    { header: 'PSP Ref. No.', property: 'pg_payment_ref_no' },
                    { header: 'Company', property: 'company' }
                ],
                data.data,
                'Receipt Register',
                [{ s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }]
            );
        });
    }

    getFilter(): any {
        let filterReq = {};
        // const filterReq = GridUtils.GetFilterReq(
        //     this._paginator,
        //     this._sort,
        //     this.searchInputControl.value
        // );
        // const filter = this.currentFilter;
        filterReq['status'] = this.currentFilter.status;
        filterReq['payment_gateway'] = 'All';
        filterReq['fromDate'] = DateTime.fromJSDate(
            this.currentFilter.fromDate
        ).toFormat('yyyy-MM-dd');
        filterReq['toDate'] = DateTime.fromJSDate(
            this.currentFilter.toDate
        ).toFormat('yyyy-MM-dd');
        return filterReq;
    }

    filter(): void {
        this.matDialog
            .open(PaymentFilterComponent, {
                data: { data: this.currentFilter, name: 'Receipt filter' },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.currentFilter = res;
                    this.refreshItems();
                }
            });
    }

    // get selectedColumns(): Column[] {
    //     return this._selectedColumns;
    // }

    // set selectedColumns(val: Column[]) {
    //     if (Array.isArray(val)) {
    //         this._selectedColumns = this.cols.filter(col =>
    //             val.some(selectedCol => selectedCol.field === col.field)
    //         );
    //     } else {
    //         this._selectedColumns = [];
    //     }
    // }

    refreshItems(event?: any): void {
        this.isLoading = true;
        let extraModel = this.getFilter();
        let newModel = this.getNewFilterReq(event);
        let model = { ...extraModel, ...newModel }
        this.accountService.getReceiptRegister(model).subscribe({
            next: (data) => {
                this.dataList = data.data;
                // this.total = data.total;
                this.totalRecords = data.total;
                this.isLoading = false;
            },
            error: (err) => {
                this.alertService.showToast('error', err);
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

    ngOnDestroy(): void {
        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
        // this.masterService.setData(this.key, this);
    }

    displayColCount(): number {
        return this.selectedColumns.length + 1;
    }


    isValidDate(value: any): boolean {
        const date = new Date(value);
        return value && !isNaN(date.getTime());
    }

}
