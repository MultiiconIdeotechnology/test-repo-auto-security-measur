import { Component, OnDestroy, Input } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { messages, module_name, Security, saleProductPermissions, filter_module_name } from 'app/security';
import { MatDialog } from '@angular/material/dialog';
import { SalesProductsService } from 'app/services/slaes-products.service';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { AgentProductInfoComponent } from 'app/modules/crm/agent/product-info/product-info.component';
import { AgentService } from 'app/services/agent.service';
import { RefferralService } from 'app/services/referral.service';
import { UserService } from 'app/core/user/user.service';
import { Subscription, takeUntil } from 'rxjs';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'app-sales-product',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
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
        // RouterOutlet,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        NgxMatSelectSearchModule,
        MatTabsModule,
        PrimeNgImportsModule,
        DatePipe,
        // ProductTabComponent
    ],
    templateUrl: './sales-product.component.html',
    styleUrls: ['./sales-product.component.scss']
})
export class SalesProductComponent extends BaseListingComponent implements OnDestroy {
    @Input() isFilterShow:boolean = false;
    dataList = [];
    total = 0;
    module_name = module_name.products;
    filter_table_name = filter_module_name.report_sales_products;
    private settingsUpdatedSubscription: Subscription;
    agentList: any[] = [];
    employeeList: any[] = [];
    selectedAgent: any;
    selectedRM: any;
    user: any = {};
    selectedToolTip: string = "";
    toolTipArray: any[] = [];

    constructor(
        private salesProductsService: SalesProductsService,
        private matDialog: MatDialog,
        private _userService: UserService,
        private agentService: AgentService,
        private refferralService: RefferralService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.products)
        this.key = 'campaign_name';
        this.sortColumn = 'agent_code';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);

        //user login
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: any) => {
                this.user = user;
            });
    }


    ngOnInit(): void {
        this.agentList = this._filterService.agentListByValue;
        this.employeeList = this._filterService.rmListByValue;

        // common filter
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.selectedAgent = resp['table_config']['agency_name']?.value;
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }

            this.selectedRM = resp['table_config']['rm']?.value;
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
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
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
            this.primengTable['filters'] = filterData['table_config'];
        }
    }

    getFilter(): any {
        const filterReq = GridUtils.GetFilterReq(
            this._paginator,
            this._sort,
            this.searchInputControl.value,
        );
        return filterReq;
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        const request = this.getNewFilterReq(event);
        if (Security.hasPermission(saleProductPermissions.viewOnlyAssignedPermissions)) {
            request.relationmanagerId = this.user.id
        }
        this.salesProductsService.getProductReport(request).subscribe({
            next: (data) => {
                this.dataList = data.data;
                this.toolTipArray = data.itemArry;
                this.totalRecords = data.total;
                this.isLoading = false;
            }, error: (err) => {
                this.alertService.showToast('error', err)
                this.isLoading = false
            }
        });
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

    // To get Tooltip over required header
    getToolTip(val: any) {
        this.selectedToolTip = this.toolTipArray.find((item) => item.item_code == val)?.item_name
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

    viewData(record, item): void {
        // if (!Security.hasViewDetailPermission(module_name.bookingsFlight)) {
        //     return this.alertService.showToast(
        //         'error',
        //         messages.permissionDenied
        //     );
        // }
        if (item && item.value) {
            this.matDialog.open(AgentProductInfoComponent, {
                data: {
                    data: record,
                    agencyName: record?.data?.agency_name,
                    item: item,
                    readonly: true,
                    sales_product: true
                },
                disableClose: true,
            });
        }
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    exportExcel(event): void {
        if (!Security.hasExportDataPermission(module_name.products)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        const filterReq = this.getNewFilterReq({});
        const req = Object.assign(filterReq);
        req.skip = 0;
        req.take = this.totalRecords;
        const exportHeaderArr = [
            { header: 'Agent Code', property: 'agent_code' },
            { header: 'Old Agent Code', property: 'old_agent_code' },
            { header: 'Agency Name', property: 'agency_name' },
            { header: 'RM', property: 'rm' },
            { header: 'Amount', property: 'Amount' },
            { header: 'Due Amount', property: 'Due_amount' }
        ];

        if (Security.hasPermission(saleProductPermissions.viewOnlyAssignedPermissions)) {
            req.relationmanagerId = this.user.id
        }
        this.salesProductsService.getProductReport(req).subscribe(data => {
            let productData = this.transformData(data.data);

            for (let i in productData[0].itemCodes) {
                exportHeaderArr.push({ header: productData[0].itemCodes[i].key, property: productData[0].itemCodes[i].key })
            }

            Excel.export(
                'Products',
                exportHeaderArr,
                productData,
                "Products",
                [{ s: { r: 0, c: 0 }, e: { r: 0, c: 20 } }]
            );
        });
    }

    transformData(data) {
        return data.map(agent => {
            let newAgent = { ...agent };
            agent.itemCodes.forEach(item => {
                if (item.value) {
                    newAgent[item.key] = DateTime.fromISO(item.value).toFormat('dd-MM-yyyy');
                } else {
                    newAgent[item.key] = item.value || " "
                }
            });
            return newAgent;
        });
    }
}
