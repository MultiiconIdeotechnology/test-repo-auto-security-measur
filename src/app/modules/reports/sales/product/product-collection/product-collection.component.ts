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
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, filter_module_name, module_name, poductCollectionPermissions } from 'app/security';
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
import { ProductTabComponent } from '../product-tab/product-tab.component';
import { RefferralService } from 'app/services/referral.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'app-product-collection',
    standalone: true,
    templateUrl: './product-collection.component.html',
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
        ProductTabComponent,
        PrimeNgImportsModule
    ],
})

export class ProductCollectionComponent extends BaseListingComponent implements OnDestroy {
    module_name = module_name.products_collection;
    filter_table_name = filter_module_name.products_collection;
    private settingsUpdatedSubscription: Subscription;
    isLoading = false;
    dataList = [];
    totalsObj: any = {};
    isFilterShow: boolean = false;
    selectedAgent: any;
    agentList: any[] = [];
    selectedRM: any;
    employeeList: any = [];
    user: any = {};

    statusList: any[] = [
        { label: 'Inprocess', value: 'Inprocess' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Blocked', value: 'Blocked' },
        { label: 'Delivered', value: 'Delivered' },
    ];

    constructor(
        private accountService: AccountService,
        private agentService: AgentService,
        private matDialog: MatDialog,
        private refferralService: RefferralService,
        public _filterService: CommonFilterService,
        public userService: UserService,
    ) {
        super(module_name.products_collection);

        this.sortColumn = 'installment_date';
        this.sortDirection = 'desc';
        this._filterService.applyDefaultFilter(this.filter_table_name);

        this.userService.user$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((user: any) => {
            this.user = user;
        });
    }

    ngOnInit(): void {
        // this.getAgent('');
        this.agentList = this._filterService.agentListByValue;
        this.employeeList = this._filterService.rmListByValue;
        // this.getEmployeeList("");

        // common filter
        this._filterService.selectionDateDropdown = "";
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
            this._filterService.selectionDateDropdown = "";
            this.selectedAgent = resp['table_config']['agency_name']?.value;
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }
            this.selectedRM = resp['table_config']['rm']?.value;

            if (resp['table_config']['installment_date']?.value && Array.isArray(resp['table_config']['installment_date']?.value)) {
                this._filterService.selectionDateDropdown = 'custom_date_range';
                this._filterService.rangeDateConvert(resp['table_config']['installment_date']);
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
            this.selectedRM = filterData['table_config']['rm']?.value;

            
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }

            if (filterData['table_config']['installment_date']?.value && Array.isArray(filterData['table_config']['installment_date']?.value)) {
                this._filterService.selectionDateDropdown = 'custom_date_range';
                this._filterService.rangeDateConvert(filterData['table_config']['installment_date']);
            }

            this.primengTable['filters'] = filterData['table_config'];
        }
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
                agencyName: record?.agency_name,
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
        record.agent_name = record.agency_name;
        this.matDialog.open(AgentProductInfoComponent, {
            data: {
                data: record,
                agencyName: record?.agency_name,
                readonly: true,
                account_receipt: true,
            },
            disableClose: true,
        });

    }

    viewAgentData(data: any): void {
        Linq.recirect([Routes.customers.agent_entry_route + '/' + data.agent_id + '/readonly']);
    }

    refreshItems(event?: any): void {
        this.isLoading = true;

        let newModel = this.getNewFilterReq(event);

        if (Security.hasPermission(poductCollectionPermissions.viewOnlyAssignedPermissions)) {
            newModel["relationmanagerId"] = this.user.id
        }

        this.accountService.getCollectionList(newModel).subscribe({
            next: (data) => {
                this.dataList = data.data;
                this.totalRecords = data.total;
                this.totalsObj = data.totals || 0;
                this.isLoading = false;
                if (this.dataList && this.dataList.length) {
                    setTimeout(() => {
                        // this.isFrozenColumn('', ['index', 'payment_attachment',]);
                    }, 200);
                }
            },
            error: (err) => {
                this.alertService.showToast('error', err);
                this.isLoading = false;
            },
        });
    }

    // Status
    getStatusColor(status: string): string {
        if (status == 'Pending') {
          return 'text-blue-600';
        } else if (status == 'Inprocess') {
          return 'text-yellow-600';
        } else if (status == 'Delivered') {
          return 'text-green-600';
        } else if (status == 'Blocked') {
          return 'text-red-600';
        } else {
          return '';
        }
      }

    exportExcel(): void {
        // if (!Security.hasExportDataPermission(this.module_name)) {
        //     return this.alertService.showToast(
        //         'error',
        //         messages.permissionDenied
        //     );
        // }

        const filterReq = this.getNewFilterReq({});

        filterReq['Filter'] = this.searchInputControl.value;
        filterReq['Take'] = this.totalRecords;

        if (Security.hasPermission(poductCollectionPermissions.viewOnlyAssignedPermissions)) {
            filterReq["relationmanagerId"] = this.user.id
        }

        this.accountService.getCollectionList(filterReq).subscribe((data) => {
            for (var dt of data.data) {
                dt.installment_date = dt.installment_date ? DateTime.fromISO(dt.installment_date).toFormat('dd-MM-yyyy') : '';
            }
            ['agent_code', 'agency_name', 'rm', 'product', 'status', 'installment_amount', 'due_Amount', 'installment_date']
            Excel.export(
                'Collection',
                [
                    { header: 'Agent Code', property: 'agent_code' },
                    { header: 'Agent', property: 'agency_name' },
                    { header: 'RM', property: 'rm' },
                    { header: 'Product name', property: 'product' },
                    { header: 'Status', property: 'status' },
                    { header: 'Amount', property: 'installment_amount' },
                    { header: 'Due Amount', property: 'due_Amount' },
                    { header: 'Installment Date', property: 'installment_date' },
                ],
                data.data,
                'Collection',
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
