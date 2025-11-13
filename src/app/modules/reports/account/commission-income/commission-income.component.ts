import { filter_module_name, messages, module_name, Security } from 'app/security';
import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AppConfig } from 'app/config/app-config';
import { AccountService } from 'app/services/account.service';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { Linq } from 'app/utils/linq';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { cloneDeep } from 'lodash';

@Component({
    selector: 'app-commission-income',
    templateUrl: './commission-income.component.html',
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
export class CommissionIncomeComponent
    extends BaseListingComponent
    implements OnDestroy {
    module_name = module_name.commissionIncome;
    filter_table_name = filter_module_name.commission_income;
    private settingsUpdatedSubscription: Subscription;
    dataList = [];
    total = 0;
    user: any;
    is_first: any;
    currentFilter: any;
    infoList = [];
    public Filter: any;
    public key: any = 'booking_date';
    appConfig = AppConfig;
    settings: any;
    supplierList: any[] = [];
    selectedSupplier: any;
    isFilterShow: boolean = false;

    index = {
        commission: -1,
        tds: -1,
        net_commission: -1,
    };

    types = Types;
    selectedColumns: Column[] = [];
    exportCol: Column[] = [];
    activeFiltData: any = {};
    cols: Column[] = [];

    constructor(
        private accountService: AccountService,
        private kycDocumentService: KycDocumentService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.commissionIncome);
        this.key = this.module_name;
        this.sortColumn = 'booking_date';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
        this.selectedColumns = [
            { field: 'booking_date', header: 'Booking Date', type: Types.dateTime, dateFormat: 'dd-MM-yyyy HH:mm:ss', isFrozen: false },
            { field: 'booking_ref_no', header: 'Booking Ref. No.', type: Types.link },
            { field: 'pnr', header: 'PNR', type: Types.text },
            { field: 'gds_pnr', header: 'GSD PNR', type: Types.text },
            { field: 'purchase_commission', header: 'Commission', type: Types.number, fixVal: 2, class: 'text-right' },
            { field: 'tds', header: 'TDS', type: Types.number, fixVal: 2, class: 'text-right' },
            { field: 'net_commission', header: 'Net Commission', type: Types.number, fixVal: 2, class: 'text-right' },
            { field: 'supplier', header: 'Supplier', type: Types.select }
        ];

        this.cols.unshift(...this.selectedColumns);
        this.exportCol = cloneDeep(this.cols);
    }

    ngOnInit() {
        this.getSupplier("", true);

        // common filter
        this._filterService.updateSelectedOption('');
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
            this._filterService.updateSelectedOption('');
            this.selectedSupplier = resp['table_config']['supplier']?.value;

            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['booking_date']?.value && Array.isArray(resp['table_config']['booking_date']?.value)) {
                this._filterService.selectionDateDropdown = 'custom_date_range';
                this._filterService.rangeDateConvert(resp['table_config']['booking_date']);
            }
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShow = true;
            this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns); //  add new
            this.primengTable._filter();
        });

    }

    ngAfterViewInit() {
        // Defult Active filter show
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShow = true;
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            this.selectedSupplier = filterData['table_config']['supplier']?.value;
            if (filterData['table_config']['booking_date']?.value && Array.isArray(filterData['table_config']['booking_date']?.value)) {
                this._filterService.selectionDateDropdown = 'custom_date_range';
                this._filterService.rangeDateConvert(filterData['table_config']['booking_date']);
            }
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
            this.primengTable['filters'] = filterData['table_config'];
            this.selectedColumns = this.checkSelectedColumn(filterData['selectedColumns'] || [], this.selectedColumns); //  add new
            this.onColumnsChange(); //  add new
        } else { //  add new
            this.selectedColumns = this.checkSelectedColumn([], this.selectedColumns); //  add new
            this.onColumnsChange(); //  add new
        }
        this.getColIndex();
    }
    getColIndex(): void { //  add new
        this.index.commission = this.selectedColumns.findIndex((item: any) => item.field == 'purchase_commission');
        this.index.tds = this.selectedColumns.findIndex((item: any) => item.field == 'tds');
        this.index.net_commission = this.selectedColumns.findIndex((item: any) => item.field == 'net_commission');
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
        this.getColIndex(); //  add new
    }

    isAnyIndexMatch(): boolean { //  add new
        const len = this.selectedColumns?.length - 1;
        return len == this.index.commission || len == this.index.tds || len == this.index.net_commission;
    }

    isDisplayFooter(): boolean { //  add new
        return this.selectedColumns.some(x => x.field == 'purchase_commission' || x.field == 'tds' || x.field == 'net_commission');
    }

    isNotDisplay(field: string): boolean { //  add new
        return field != "purchase_commission" && field != "tds" && field != "net_commission"
    }

    refreshItems(event?: any): void {
        this.accountService.getcommissionIncome(this.getNewFilterReq(event)).subscribe({
            next: (data) => {
                this.dataList = data.data;
                this.total = data.total;
                this.totalRecords = data.total;
                this.tablesTotal = data.totals;
                this.isLoading = false;
            },
            error: (err) => {
                this.alertService.showToast('error', err);
                this.isLoading = false;
            },
        });
    }

    viewData(record): void {
        // if (!Security.hasViewDetailPermission(module_name.bookingsFlight)) {
        //     return this.alertService.showToast(
        //         'error',
        //         messages.permissionDenied
        //     );
        // }

        if (record?.booking_ref_no?.substring(0, 3) == 'FLT') {
            Linq.recirect('/booking/flight/details/' + record.service_for_id);
        }
        else if (record?.booking_ref_no?.substring(0, 3) == 'VIS') {
            Linq.recirect('/booking/visa/details/' + record.service_for_id);
        }
        else if (record?.booking_ref_no?.substring(0, 3) == 'BUS') {
            Linq.recirect('/booking/bus/details/' + record.service_for_id);
        }
        else if (record?.booking_ref_no?.substring(0, 3) == 'HTL') {
            Linq.recirect('/booking/hotel/details/' + record.service_for_id);
        }
        else if (record?.booking_ref_no?.substring(0, 3) == 'AGI') {
            Linq.recirect('/booking/group-inquiry/details/' + record.service_for_id);
        }
        else if (record?.booking_ref_no?.substring(0, 3) == 'OSB') {
            Linq.recirect('/booking/offline-service/entry/' + record.service_for_id + '/readonly');
        }
    }

    getSupplier(value: string, bool: boolean = true) {
        this.kycDocumentService.getSupplierCombo(value, '').subscribe((data) => {
            this.supplierList = data;

            for (let i in this.supplierList) {
                this.supplierList[i].id_by_value = this.supplierList[i].company_name;
            }
        });
    }

    getNodataText(): string {
        if (this.isLoading) return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    exportExcel(): void {
        if (!Security.hasExportDataPermission(this.module_name)) {
            return this.alertService.showToast(
                'error',
                messages.permissionDenied
            );
        }

        const filterReq = this.getNewFilterReq({});

        filterReq['Take'] = this.totalRecords;

        this.accountService.getcommissionIncome(filterReq).subscribe((data) => {
            for (var dt of data.data) {
                dt.booking_date = dt.booking_date ? DateTime.fromISO(dt.booking_date).toFormat('dd-MM-yyyy hh:mm a') : '';
            }
            Excel.export(
                'Commission Income',
                [
                    { header: 'Booking Date', property: 'booking_date' },
                    { header: 'Booking Ref. No.', property: 'booking_ref_no' },
                    { header: 'PNR', property: 'pnr' },
                    { header: 'GSD PNR', property: 'gds_pnr' },
                    { header: 'Commission', property: 'purchase_commission' },
                    { header: 'TDS ', property: 'tds' },
                    { header: 'Net Commission', property: 'net_commission' },
                    { header: 'Supplier', property: 'supplier' }
                ],
                data.data,
                'Commission Income',
                [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]
            );
        });
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
