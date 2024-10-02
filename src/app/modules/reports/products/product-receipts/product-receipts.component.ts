import { NgIf, NgFor, DatePipe, CommonModule, NgClass } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
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
import { AppConfig } from 'app/config/app-config';
import { BaseListingComponent } from 'app/form-models/base-listing';
import {
    Security,
    filter_module_name,
    messages,
    module_name,
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
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'app-product-receipts',
    standalone: true,
    templateUrl: './product-receipts.component.html',
    imports: [
        NgIf,
        NgFor,
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
        RouterOutlet,
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
    module_name = module_name.products_receipts;
    filter_table_name = filter_module_name.products_receipts;
    private settingsUpdatedSubscription: Subscription;
    isLoading = false;
    dataList = [];
    total_amount: any = 0;
    isFilterShow: boolean = false;
    selectedAgent: any;
    agentList: any[] = [];

    statusList: any[] = [
        { label: 'Confirmed', value: 'Confirmed' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Rejected', value: 'Rejected' },
    ];

    constructor(
        private accountService: AccountService,
        private agentService: AgentService,
        private matDialog: MatDialog,
        public _filterService: CommonFilterService,
    ) {
        super(module_name.products_receipts);

        this.sortColumn = 'receipt_request_date';
        this.sortDirection = 'desc';
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit(): void {
        this.getAgent('');

        // common filter
        this._filterService.selectionDateDropdown = "";
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
            this._filterService.selectionDateDropdown = "";
            this.selectedAgent = resp['table_config']['agent_name']?.value;
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }

            if (resp['table_config']['receipt_request_date']?.value != null && resp['table_config']['receipt_request_date'].value.length) {
                this._filterService.selectionDateDropdown = 'Custom Date Range';
                this._filterService.rangeDateConvert(resp['table_config']['receipt_request_date']);
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
            this.selectedAgent = filterData['table_config']['agent_name']?.value;
            if (filterData['table_config']['receipt_request_date']?.value != null && filterData['table_config']['receipt_request_date'].value.length) {
                this._filterService.selectionDateDropdown = 'Custom Date Range';
                this._filterService.rangeDateConvert(filterData['table_config']['receipt_request_date']);
            }

            this.primengTable['filters'] = filterData['table_config'];
        }
    }

    // function to get the Agent list from api
    getAgent(value: string) {
        this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
            this.agentList = data;

            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }

            for (let i in this.agentList) {
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`;
                this.agentList[i].id_by_value = this.agentList[i].agency_name;
            }
        })
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
            return 'bg-yellow-600';
        } else if (status == 'Audited') {
            return 'bg-green-600';
        } else if (status == 'Rejected') {
            return 'bg-red-600';
        } else if (status == 'Confirmed') {
            return 'bg-green-600';
        } else {
            return 'bg-blue-600';
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
        Linq.recirect([Routes.customers.agent_entry_route + '/' + data.receipt_to_id + '/readonly']);
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        let extraModel = {
            service_for: "Product Purchase"
        };
        let newModel = this.getNewFilterReq(event);
        let model = { ...extraModel, ...newModel }
        this.accountService.getReceiptList(model).subscribe({
            next: (data) => {
                this.dataList = data.data;
                this.totalRecords = data.total;
                this.total_amount = data.total_amount || 0;
                this.isLoading = false;
                if (this.dataList && this.dataList.length) {
                    setTimeout(() => {
                        this.isFrozenColumn('', ['index', 'payment_attachment', 'receipt_ref_no']);
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
                dt.receipt_request_date = dt.receipt_request_date ? DateTime.fromISO(dt.receipt_request_date).toFormat('dd-MM-yyyy hh:mm a') : '';
                dt.agent_name = dt.agent_Code + ' ' + dt.agent_name;
            }
            ['receipt_ref_no', 'receipt_status', 'payment_amount', 'receipt_request_date', 'agent_name', 'rm_name', 'product_name']
            Excel.export(
                'Receipt',
                [
                    { header: 'Reference No.', property: 'receipt_ref_no' },
                    { header: 'Status', property: 'receipt_status' },
                    { header: 'Amount', property: 'payment_amount' },
                    { header: 'Request', property: 'receipt_request_date' },
                    { header: 'Agent', property: 'agent_name' },
                    { header: 'RM', property: 'rm_name' },
                    { header: 'Product name', property: 'product_name' },
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

    ngOnDestroy(): void {
        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }
}