import { filter_module_name, messages, module_name, Security } from 'app/security';
import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
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
import { PspSettingService } from 'app/services/psp-setting.service';
import { AgentService } from 'app/services/agent.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-purchase-register',
    templateUrl: './purchase-register.component.html',
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
export class PurchaseRegisterComponent
    extends BaseListingComponent
    implements OnDestroy {
    module_name = module_name.purchaseRegister;
    filter_table_name = filter_module_name.purchase_register;
    private settingsUpdatedSubscription: Subscription;
    dataList = [];
    total = 0;
    user: any;
    is_first: any;
    currentFilter: any;
    infoList = [];
    public Filter: any;
    public key: any = 'entry_date_time';
    appConfig = AppConfig;
    settings: any;
    typeList = ['Normal', 'Corporate'];
    companyList: any[] = [];
    cols: Column[];
    isFilterShow: boolean = false;
    supplierList: any[] = [];
    agentList: any[] = [];
    selectedSupplier:any;
    selectedAgent:any;
    selectedCompany!: any;

    constructor(
        private accountService: AccountService,
        private kycDocumentService: KycDocumentService,
        private pspsettingService: PspSettingService,
        public agentService: AgentService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.purchaseRegister);
        // this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'entry_date_time';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit() {
        this.getSupplier("");
        this.agentList = this._filterService.agentListByValue;
        this.getCompanyList("");

        // common filter
        this._filterService.selectionDateDropdown = "";
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
            this._filterService.selectionDateDropdown = "";
            this.selectedAgent = resp['table_config']['agency_name']?.value;
            if(this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                  this.agentList.push(this.selectedAgent);
                }
            }

            this.selectedSupplier = resp['table_config']['company_name']?.value;
            this.selectedCompany = resp['table_config']['company']?.value;
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['entry_date_time']?.value != null && resp['table_config']['entry_date_time'].value.length) {
                this._filterService.selectionDateDropdown = 'Custom Date Range';
                this._filterService.rangeDateConvert(resp['table_config']['entry_date_time']);
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
            this.selectedAgent = filterData['table_config']['agency_name']?.value;
            this.selectedSupplier = filterData['table_config']['company_name']?.value;
            this.selectedCompany = filterData['table_config']['company']?.value;
            if(this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                  this.agentList.push(this.selectedAgent);
                }
            }
            if (filterData['table_config']['entry_date_time']?.value != null && filterData['table_config']['entry_date_time']?.value.length) {
                this._filterService.selectionDateDropdown = 'Custom Date Range';
                this._filterService.rangeDateConvert(filterData['table_config']['entry_date_time']);
            }
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
            this.primengTable['filters'] = filterData['table_config'];
        }
    }

    getCompanyList(value) {
        this.pspsettingService.getCompanyCombo(value).subscribe((data) => {
            this.companyList = data;

            for(let i in this.companyList){
                this.companyList[i].id_by_value = this.companyList[i].company_name;
            }
        })
    }

    getAgent(value: string) {
        this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
            this.agentList = data;

            for(let i in this.agentList){
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`;
                this.agentList[i].id_by_value = this.agentList[i].agency_name;
            }
        })
    }

    getSupplier(value: string) {
        this.kycDocumentService.getSupplierCombo(value, '').subscribe((data) => {
            this.supplierList = data;

            for(let i in this.supplierList){
                this.supplierList[i].id_by_value = this.supplierList[i].company_name;
            }
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
        else if (record?.booking_ref_no?.substring(0, 3) == 'OSB') {
            Linq.recirect('/booking/offline-service/entry/' + record.purchase_id + '/readonly');
        }
    }

    refreshItems(event?: any): void {
        this.accountService.getpurchaseRegister(this.getNewFilterReq(event)).subscribe({
            next: (data) => {
                this.dataList = data.data;
                this.total = data.total;
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

    exportExcel(): void {
        if (!Security.hasExportDataPermission(this.module_name)) {
            return this.alertService.showToast(
                'error',
                messages.permissionDenied
            );
        }

        const filterReq = this.getNewFilterReq({});
        filterReq['Take'] = this.totalRecords;
        this.accountService.getpurchaseRegister(filterReq).subscribe((data) => {
            for (var dt of data.data) {
                dt.booking_date = dt.booking_date ? DateTime.fromISO(dt.booking_date).toFormat('dd-MM-yyyy hh:mm a') : '';
            }
            Excel.export(
                'Purchase Register',
                [
                    { header: 'Payment Ref. No.', property: 'payment_ref_no' },
                    { header: 'Date', property: 'entry_date_time' },
                    { header: 'Agent Code', property: 'agent_code' },
                    { header: 'Agency Name', property: 'agency_name' },
                    { header: 'Service', property: 'service_for' },
                    { header: 'Booking Ref. No.', property: 'booking_ref_no' },
                    { header: 'PNR', property: 'pnr' },
                    { header: 'GDS PNR', property: 'gds_pnr' },
                    { header: 'Supplier ', property: 'company_name' },
                    { header: 'Currency', property: 'currency_short_code' },
                    { header: 'Amount', property: 'payment_amount' },
                    { header: 'Booking Type', property: 'booking_Type' },
                    { header: 'Company', property: 'company' }
                ],
                data.data,
                'Purchase Register',
                [{ s: { r: 0, c: 0 }, e: { r: 0, c: 12 } }]
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
}
