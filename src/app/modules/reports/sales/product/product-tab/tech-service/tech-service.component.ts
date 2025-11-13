import { Component, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
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
import { module_name, Security, saleProductPermissions, filter_module_name, messages } from 'app/security';
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { AgentService } from 'app/services/agent.service';
import { RefferralService } from 'app/services/referral.service';
import { UserService } from 'app/core/user/user.service';
import { Subscription, takeUntil } from 'rxjs';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { ProductTechService } from 'app/services/product-techService.service';
import { MatDialog } from '@angular/material/dialog';
import { AgentProductInfoComponent } from 'app/modules/crm/agent/product-info/product-info.component';
import { Linq } from 'app/utils/linq';
import { Routes } from 'app/common/const';
import { OverlayPanel } from 'primeng/overlaypanel';
import { cloneDeep } from 'lodash';
@Component({
    selector: 'app-tech-service',
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
    templateUrl: './tech-service.component.html',
    styleUrls: ['./tech-service.component.scss']
})
export class TechServiceComponent extends BaseListingComponent {
    @Input() isFilterShow: boolean = false;
    @Output() isFilterShowEvent = new EventEmitter(false);
    @ViewChild('op') overlayPanel!: OverlayPanel;
    dataList = [];
    total = 0;
    module_name = module_name.products_tech_service;
    filter_table_name = filter_module_name.products_tech_service;
    private settingsUpdatedSubscription: Subscription;
    agentList: any[] = [];
    employeeList: any[] = [];
    selectedAgent: any;
    selectedRM: any;
    user: any = {};
    selectedToolTip: string = "";
    toolTipArray: any[] = [];
    productStatusList: any[] = ['Inprocess', 'Pending', 'Blocked', 'Delivered'];
    statusColorMap: any = {
        Inprocess: 'text-blue-600',
        Pending: 'text-yellow-600',
        Blocked: 'text-red-600',
        Delivered: 'text-green-600',
        Expired: 'text-red-800'
    }
    itemStatusList: any[] = ['Inprocess', 'Pending', 'Blocked', 'Delivered'];

    types = Types;
    selectedColumns: Column[] = [];
    exportCol: Column[] = [];
    activeFiltData: any = {};
    cols: Column[] = [];

    constructor(
        private productTechService: ProductTechService,
        private _userService: UserService,
        private agentService: AgentService,
        private refferralService: RefferralService,
        public _filterService: CommonFilterService,
        public matDialog: MatDialog
    ) {
        super(module_name.products_tech_service)
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
        this.selectedColumns = [

            { field: 'agent_code', header: 'Agent Code', type: Types.number, fixVal: 0 },
            { field: 'agency_name', header: 'Agency Name', type: Types.select },
            { field: 'rm', header: 'RM', type: Types.select },
            { field: 'item_code', header: 'Item Code', type: Types.text },
            { field: 'item', header: 'Item', type: Types.text },
            { field: 'product', header: 'Product', type: Types.link },
            { field: 'product_status', header: 'Product Status', type: Types.select, isCustomColor: true },
            { field: 'item_status', header: 'Item Status', type: Types.select, isCustomColor: true },
            { field: 'expiry_date', header: 'Expiry Date', type: Types.dateTime, dateFormat: 'dd-MM-yyyy' },
            { field: 'product_amount', header: 'Product Amount', type: Types.number, fixVal: 2, class: 'text-right' },
            { field: 'due_amount', header: 'Due Amount', type: Types.number, fixVal: 2, class: 'text-right' }
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

        // common filter subscription
        this.startSubscription();
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

            if (filterData['table_config']['expiry_date']?.value != null && filterData['table_config']['expiry_date'].value.length) {
                this._filterService.updateSelectedOption('custom_date_range');
                this._filterService.rangeDateConvert(filterData['table_config']['expiry_date']);
            }
            this.isFilterShowEvent.emit(true)
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
            this.primengTable['filters'] = filterData['table_config'];
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

    refreshItems(event?: any): void {
        this.isLoading = true;
        const request = this.getNewFilterReq(event);
        if (Security.hasPermission(saleProductPermissions.viewOnlyAssignedPermissions)) {
            request.relationmanagerId = this.user.id
        }
        this.productTechService.getTechServiceReport(request).subscribe({
            next: (data) => {
                this.dataList = data.data;
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

    // Api to get the Employee list data
    getEmployeeList(value: string) {
        this.refferralService.getEmployeeLeadAssignCombo(value).subscribe((data: any) => {
            this.employeeList = data;

            for (let i in this.employeeList) {
                this.employeeList[i].id_by_value = this.employeeList[i].employee_name;
            }
        });
    }

    purchaseProductInfo(record: any): void {
        // if (!Security.hasNewEntryPermission(module_name.crmagent)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }
        this.matDialog.open(AgentProductInfoComponent, {
            data: { data: record, agencyName: record?.agency_name, readonly: true, agentInfo: true, currencySymbol: record?.currencySymbol },
            disableClose: true
        });
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    exportExcel(): void {
        if (!Security.hasExportDataPermission(module_name.products)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        const filterReq = this.getNewFilterReq({});
        const req = Object.assign(filterReq);
        req.skip = 0;
        req.take = this.totalRecords;
        const exportHeaderArr = [
            { header: 'Agent Code', property: 'agent_code' },
            { header: 'Agency Name', property: 'agency_name' },
            { header: 'RM', property: 'rm' },
            { header: 'Item Code', property: 'item_code' },
            { header: 'Item', property: 'item' },
            { header: 'Product', property: 'product' },
            { header: 'Product Status', property: 'product_status' },
            { header: 'Item Status', property: 'item_status' },
            { header: 'Expiry Date', property: 'expiry_date' },
            { header: 'Product Amount', property: 'product_amount' },
            { header: 'Due Amount', property: 'due_amount' },
        ];

        if (Security.hasPermission(saleProductPermissions.viewOnlyAssignedPermissions)) {
            req.relationmanagerId = this.user.id
        }
        this.productTechService.getTechServiceReport(req).subscribe(data => {
            let productData = data.data;

            productData.forEach((item: any) => {
                item.expiry_date = item.expiry_date ? (DateTime.fromISO(item.expiry_date).toFormat('dd-MM-yyyy')) : '';
            })

            Excel.export(
                'Tech-Service',
                exportHeaderArr,
                productData,
                "Product Tech Service",
                [{ s: { r: 0, c: 0 }, e: { r: 0, c: 20 } }]
            );
        });
    }

    viewInternal(record: any): void {
        Linq.recirect(Routes.customers.agent_entry_route + '/' + record.agentid + '/readonly')
    }

    startSubscription() {
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.selectedAgent = resp['table_config']['agency_name']?.value;
            this.selectedRM = resp['table_config']['rm']?.value;
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }

            if (resp['table_config']['expiry_date']?.value != null && resp['table_config']['expiry_date'].value.length) {
                this._filterService.updateSelectedOption('custom_date_range');
                this._filterService.rangeDateConvert(resp['table_config']['expiry_date']);
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
        this.settingsUpdatedSubscription.unsubscribe();
    }

    displayColCount(): number {
        return this.selectedColumns.length + 1;
    }


    isValidDate(value: any): boolean {
        const date = new Date(value);
        return value && !isNaN(date.getTime());

    }

}
