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
import { messages, module_name, Security, saleProductPermissions, filter_module_name, agentPermissions, partnerRegisterPermissions } from 'app/security';
import { SalesProductsService } from 'app/services/slaes-products.service';
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { AgentService } from 'app/services/agent.service';
import { RefferralService } from 'app/services/referral.service';
import { UserService } from 'app/core/user/user.service';
import { Subscription, takeUntil } from 'rxjs';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { Linq } from 'app/utils/linq';
import { Routes } from 'app/common/const';
import { DialAgentCallListComponent } from 'app/modules/crm/agent/dial-call-list/dial-call-list.component';
import { MatDialog } from '@angular/material/dialog';
import { AgentFollowupComponent } from '../agent-followup/agent-followup.component';
import { cloneDeep } from 'lodash';

@Component({
    selector: 'app-agent-summary',
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
    templateUrl: './agent-summary.component.html',
    styleUrls: ['./agent-summary.component.scss']
})
export class AgentSummaryComponent extends BaseListingComponent implements OnDestroy {
    dataList = [];
    total = 0;
    module_name = module_name.agentSummary;
    filter_table_name = filter_module_name.report_sales_agent_summary;
    private settingsUpdatedSubscription: Subscription;
    agentList: any[] = [];
    employeeList: any[] = [];
    selectedAgent: any;
    selectedRM: any;
    prevSelectedRM: any;

    user: any = {};
    selectedToolTip: string = "";
    isFilterShow: boolean = false;

    types = Types;
    cols: Column[] = [];
    selectedColumns: Column[] = [];
    exportCol: Column[] = [];
    activeFiltData: any = {};

    constructor(
        private salesProductsService: SalesProductsService,
        private _userService: UserService,
        private agentService: AgentService,
        private refferralService: RefferralService,
        public _filterService: CommonFilterService,
        private matDialog: MatDialog
    ) {
        super(module_name.agentSummary)
        this.key = 'volume';
        this.sortColumn = 'volume';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);

        //user login
        this._userService.user$.pipe((takeUntil(this._unsubscribeAll))).subscribe((user: any) => {
            this.user = user;
        });

        this.selectedColumns = [
            { field: 'followup', header: 'Calls', type: Types.number, fixVal: 0, class: 'text-center' },
            { field: 'agent_code', header: 'Agent Code', type: Types.number, fixVal: 0, },
            { field: 'agent_name', header: 'Agency Name', type: Types.link },
            { field: 'rm', header: 'RM', type: Types.select },
            { field: 'status', header: 'Status', type: Types.select , isCustomColor : true },
            { field: 'volume', header: 'Volume', type: Types.number, fixVal: 2 },
            { field: 'tec_product', header: 'Tech Product', type: Types.boolean },
            { field: 'tech_gp', header: 'Tech GP', type: Types.number, fixVal: 2, class:'text-right' },
            { field: 'last_call_date', header: 'Last Followup Date', type: Types.date, dateFormat: 'dd-MM-yyyy' },
            { field: 'create_date', header: 'Create Date', type: Types.dateTime, dateFormat: 'dd-MM-yyyy' },
            { field: 'last_login_time', header: 'Last Login Date', type: Types.date, dateFormat: 'dd-MM-yyyy' },
            { field: 'last_trancation_date', header: 'Last Transaction Date', type: Types.date, dateFormat: 'dd-MM-yyyy' },
            { field: 'statuschange_date', header: 'Last Status Change Date', type: Types.date, dateFormat: 'dd-MM-yyyy' }, 
            { field: 'previous_relation_manager', header: 'Previous RM', type: Types.select },
        ];
        this.cols.unshift(...this.selectedColumns);
        this.exportCol = cloneDeep(this.cols);
    }

    ngOnInit(): void {
        this.agentList = this._filterService.agentListByValue;
        this.employeeList = this._filterService.rmListByValue;

        this.salesProductsService.remarkAdd$.subscribe(() => {
            this.refreshItems();
        })

        // common filter
        this._filterService.updateSelectedOption('');
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.selectedAgent = resp['table_config']['agent_name']?.value;
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }
            this.selectedRM = resp['table_config']['rm']?.value;
            this.prevSelectedRM = resp['table_config']['previous_relation_manager']?.value;
            if (resp['table_config']['last_call_date']?.value) {
                resp['table_config']['last_call_date'].value = new Date(resp['table_config']['last_call_date'].value);
            }
            if (resp['table_config']['create_date']?.value != null && resp['table_config']['create_date'].value.length) {
                this._filterService.updateSelectedOption('custom_date_range');
                this._filterService.rangeDateConvert(resp['table_config']['create_date']);
            }
            if (resp['table_config']['last_login_time']?.value) {
                resp['table_config']['last_login_time'].value = new Date(resp['table_config']['last_login_time'].value);
            }
            if (resp['table_config']['last_trancation_date']?.value) {
                resp['table_config']['last_trancation_date'].value = new Date(resp['table_config']['last_trancation_date'].value);
            }
            if (resp['table_config']['statuschange_date']?.value) {
                resp['table_config']['statuschange_date'].value = new Date(resp['table_config']['statuschange_date'].value);
            }

            this.sortColumn = resp['sortColumn'];
            this.primengTable['_sortField'] = resp['sortColumn'];
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShow = true;
            this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns);
            this.primengTable._filter();
        });
    }

    statusList = [
        { label: 'New', value: 'New' },
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Dormant', value: 'Dormant' }
    ];

    techProductList = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    ngAfterViewInit() {
        // Defult Active filter show
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShow = true;
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            this.selectedAgent = filterData['table_config']['agent_name']?.value;
            this.selectedRM = filterData['table_config']['rm']?.value;
            this.prevSelectedRM = filterData['table_config']['previous_relation_manager']?.value;
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }

            if (filterData['table_config']['last_call_date']?.value) {
                filterData['table_config']['last_call_date'].value = new Date(filterData['table_config']['last_call_date'].value);
            }
            if (filterData['table_config']['create_date']?.value != null && filterData['table_config']['create_date'].value.length) {
                this._filterService.updateSelectedOption('custom_date_range');
                this._filterService.rangeDateConvert(filterData['table_config']['create_date']);
            }
            if (filterData['table_config']['last_login_time']?.value) {
                filterData['table_config']['last_login_time'].value = new Date(filterData['table_config']['last_login_time'].value);
            }
            if (filterData['table_config']['last_trancation_date']?.value) {
                filterData['table_config']['last_trancation_date'].value = new Date(filterData['table_config']['last_trancation_date'].value);
            }
            if (filterData['table_config']['statuschange_date']?.value) {
                filterData['table_config']['statuschange_date'].value = new Date(filterData['table_config']['statuschange_date'].value);
            }
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

    getStatusColor(status: string): string {
        switch (status) {
            case 'Active':
                return 'text-green-600';
            case 'New':
                return 'text-blue-600';
            case 'Dormant':
            case 'Inactive':
            default:
                return 'text-red-600';
        }
    }

    callHistory(record): void {
        if (!Security.hasPermission(partnerRegisterPermissions.callHistoryFollowupPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        this.matDialog.open(AgentFollowupComponent, {
            data: { data: record, readonly: true, agencyName: record?.agent_name },
            disableClose: true,
        });
    }


    getFilter(): any {
        const filterReq = GridUtils.GetFilterReq(
            this._paginator,
            this._sort,
            this.searchInputControl.value,
        );
        return filterReq;
    }

    viewAgentData(data): void {
        Linq.recirect([Routes.customers.agent_entry_route + '/' + data.agent_code_enc + '/readonly']);
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        const request = this.getNewFilterReq(event);
        if (Security.hasPermission(saleProductPermissions.viewOnlyAssignedPermissions)) {
            request.relationmanagerId = this.user.id
        }
        this.salesProductsService.getAgentSummaryReport(request).subscribe({
            next: (data) => {
                this.dataList = data.data;
                this.totalRecords = data.total;
                this.isLoading = false;

                if (this.dataList && this.dataList.length) {
                    setTimeout(() => {
                        this.isFrozenColumn('', ['followup']);
                    }, 200);
                } else {
                    setTimeout(() => {
                        this.isFrozenColumn('', ['agent_code'], true);
                    }, 200);
                }
            }, error: (err) => {
                this.alertService.showToast('error', err)
                this.isLoading = false
            }
        });
    }

    // function to get the Agent list from api
    getAgent(value: string) {
        this.agentService.getAgentComboMaster(value, false).subscribe((data) => {
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

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    exportExcel(event): void {
        if (!Security.hasExportDataPermission(module_name.agentSummary)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const filterReq = this.getNewFilterReq({});
        const req = Object.assign(filterReq);
        req.skip = 0;
        req.Take = this.totalRecords;

        this.salesProductsService.getAgentSummaryReport(req).subscribe(data => {
            for (var dt of data.data) {
                dt.last_call_date = dt.last_call_date ? DateTime.fromISO(dt.last_call_date).toFormat('dd-MM-yyyy hh:mm a') : '';
                dt.create_date = dt.create_date ? DateTime.fromISO(dt.create_date).toFormat('dd-MM-yyyy hh:mm a') : '';
                dt.last_login_time = dt.last_login_time ? DateTime.fromISO(dt.last_login_time).toFormat('dd-MM-yyyy hh:mm a') : '';
                dt.last_trancation_date = dt.last_trancation_date ? DateTime.fromISO(dt.last_trancation_date).toFormat('dd-MM-yyyy hh:mm a') : '';
                dt.statuschange_date = dt.statuschange_date ? DateTime.fromISO(dt.statuschange_date).toFormat('dd-MM-yyyy hh:mm a') : '';
            }
            Excel.export(
                'Partner Register',
                [
                    { header: 'Agent Code', property: 'agent_code' },
                    { header: 'Agency Name', property: 'agent_name' },
                    { header: 'RM', property: 'rm' },                  
                    { header: 'Status', property: 'status' },
                    { header: 'Volumn', property: 'volume' },
                    { header: 'Tec Product', property: 'tec_product' },
                    { header: 'Tech GP', property: 'tech_gp' },
                    { header: 'Followup', property: 'followup' },
                    { header: 'Last Fowllowup Date', property: 'last_call_date' },
                    { header: 'Create Date', property: 'create_date' },
                    { header: 'Last Login Date', property: 'last_login_time' },
                    { header: 'Last Transaction Date', property: 'last_trancation_date' },
                    { header: 'Last Status Change Date', property: 'statuschange_date' },
                    { header: 'Previous RM', property: 'previous_relation_manager' },
                ],
                data.data, "Partner Register", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 15 } }]);
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

    displayColCount(): number {
        return this.selectedColumns.length + 1;
    }


    isValidDate(value: any): boolean {
        const date = new Date(value);
        return value && !isNaN(date.getTime());
    }
}
