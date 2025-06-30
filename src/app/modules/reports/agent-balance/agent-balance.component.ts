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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterOutlet } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { Security, filter_module_name, messages, module_name } from 'app/security';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentService } from 'app/services/agent.service';
import { AgentBalanceService } from 'app/services/agent-balance.service';
import { RefferralService } from 'app/services/referral.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { cloneDeep } from 'lodash';


@Component({
    selector: 'app-agent-balance',
    templateUrl: './agent-balance.component.html',
    styleUrls: ['./agent-balance.component.scss'],
    standalone: true,
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
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
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
export class AgentBalanceComponent extends BaseListingComponent implements OnDestroy {

    dataList = [];
    total = 0;
    module_name = module_name.agentBalance;
    filter_table_name = filter_module_name.agent_balance_register;
    private settingsUpdatedSubscription: Subscription;
    isFilterShow: boolean = false;
    agentList: any[] = [];
    employeeList: any[] = [];
    selectedRM: any;
    selectedAgent: any;

    types = Types;
    cols: Column[] = [];
    selectedColumns: Column[] = [];
    exportCol: Column[] = [];
    activeFiltData: any = {};

    constructor(
        private agentBalanceService: AgentBalanceService,
        private agentService: AgentService,
        private refferralService: RefferralService,
        public _filterService: CommonFilterService
        // private clipboard: Clipboard
    ) {
        super(module_name.agentBalance)
        this.key = 'payment_request_date';
        this.sortColumn = 'last_top_up';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);

        this.selectedColumns = [
            { field: 'agent_code', header: 'Agent Code', type: Types.number, isFrozen: false , fixVal:0 },
            { field: 'agent_name', header: 'Agent', type: Types.select, isFrozen: false },
            { field: 'balance', header: 'Balance', type: Types.number, fixVal: 2, class:'text-right'},
            { field: 'credit', header: 'Credit', type: Types.number, fixVal: 2,  class:'text-right'},
            { field: 'rm', header: 'RM', type: Types.select },
            { field: 'mobile', header: 'Mobile', type: Types.text },
            { field: 'email', header: 'Email', type: Types.text },
            { field: 'last_top_up', header: 'Last Top-up', type: Types.dateTime, dateFormat: 'dd-MM-yyyy HH:mm:ss' }
        ];
        this.cols.unshift(...this.selectedColumns);
        this.exportCol = cloneDeep(this.cols);
    }

    ngOnInit(): void {
        this.agentList = this._filterService.agentListByValue;
        this.employeeList = this._filterService.rmListByValue;

        // common filter
        this._filterService.updateSelectedOption('');
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this._filterService.updateSelectedOption('');
            this.selectedAgent = resp['table_config']['agent_name']?.value;
            this.selectedRM = resp['table_config']['rm']?.value;
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }

            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['last_top_up']?.value && Array.isArray(resp['table_config']['last_top_up']?.value)) {
                this._filterService.selectionDateDropdown = 'custom_date_range';
                this._filterService.rangeDateConvert(resp['table_config']['last_top_up']);
            }
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShow = true;
            this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns);
            this.primengTable._filter();
        });
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

            if (filterData['table_config']['last_top_up']?.value && Array.isArray(filterData['table_config']['last_top_up']?.value)) {
                this._filterService.selectionDateDropdown = 'custom_date_range';
                this._filterService.rangeDateConvert(filterData['table_config']['last_top_up']);
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


    getAgent(value: string) {
        this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
            this.agentList = data;

            for (let i in this.agentList) {
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`;
                this.agentList[i].id_by_value = this.agentList[i].agency_name;
            }
        })
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        this.agentBalanceService.getWalletReportList(this.getNewFilterReq(event)).subscribe({
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

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    exportExcel(): void {
        if (!Security.hasExportDataPermission(module_name.agentBalance)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const filterReq = this.getNewFilterReq({});
        const req = Object.assign(filterReq);

        req.skip = 0;
        req.take = this.totalRecords;

        this.agentBalanceService.getWalletReportList(req).subscribe(data => {
            for (var dt of data.data) {
                dt.last_top_up = dt.last_top_up ? DateTime.fromISO(dt.last_top_up).toFormat('dd-MM-yyyy hh:mm a') : '';
                dt.balance = dt.currency + ' ' + dt.balance
            }
            Excel.export(
                'Agent Balance Register',
                [
                    { header: 'Agent Code', property: 'agent_code' },
                    { header: 'Agent', property: 'agent_name' },
                    { header: 'Balance', property: 'balance' },
                    { header: 'Credit', property: 'credit' },
                    { header: 'RM', property: 'rm' },
                    { header: 'Mobile', property: 'mobile' },
                    { header: 'Email', property: 'email' },
                    { header: 'Last Top-up', property: 'last_top_up' },
                ],
                data.data, "Agent Balance Register", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }]);
        });
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
