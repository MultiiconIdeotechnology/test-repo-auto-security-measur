import { Component, OnDestroy } from '@angular/core';
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
import { RouterOutlet } from '@angular/router';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { messages, module_name, Security, saleProductPermissions } from 'app/security';
import { MatDialog } from '@angular/material/dialog';
import { SalesProductsService } from 'app/services/slaes-products.service';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { AgentProductInfoComponent } from 'app/modules/crm/agent/product-info/product-info.component';
import { AgentService } from 'app/services/agent.service';
import { RefferralService } from 'app/services/referral.service';
import { UserService } from 'app/core/user/user.service';
import { takeUntil } from 'rxjs';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';

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
        RouterOutlet,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        NgxMatSelectSearchModule,
        MatTabsModule,
        PrimeNgImportsModule,
        DatePipe
    ],
    templateUrl: './sales-product.component.html',
    styleUrls: ['./sales-product.component.scss']
})
export class SalesProductComponent extends BaseListingComponent implements OnDestroy {
    dataList = [];
    total = 0;
    module_name = module_name.products;
    agentList: any[] = [];
    employeeList: any[] = [];
    selectedAgent: string;
    selectedEmployee: string;
    user: any = {};
    selectedToolTip: string = "";
    toolTipArray: any[] = [];

    columns = [
        { key: 'agent_code', name: 'Agent Code', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: true, is_boolean: false, tooltip: true, campName: false },
        { key: 'agency_name', name: 'Agency Name', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
        { key: 'rm', name: 'RM', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, iscolor: false },
        { key: 'Due_amount', name: 'Due Amount', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, iscolor: false },
        { key: 'Amount', name: 'Amount', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, iscolor: false }
    ]
    // isFilterShow: boolean = false;

    constructor(
        private salesProductsService: SalesProductsService,
        private matDialog: MatDialog,
        private _userService: UserService,
        private agentService: AgentService,
        private refferralService: RefferralService
        // private clipboard: Clipboard
    ) {
        super(module_name.products)
        this.key = 'campaign_name';
        this.sortColumn = 'agent_code';
        this.sortDirection = 'desc';
        this.Mainmodule = this;

        //user login
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: any) => {
                this.user = user;
            });
    }


    ngOnInit(): void {
        this.getAgent("");
        this.getEmployeeList("");
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
        this.agentService.getAgentCombo(value).subscribe((data) => {
            this.agentList = data;

            for (let i in this.agentList) {
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`
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
