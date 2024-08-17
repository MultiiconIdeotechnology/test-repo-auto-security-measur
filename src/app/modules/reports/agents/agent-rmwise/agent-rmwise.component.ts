import { NgIf, NgFor, DatePipe, CommonModule, NgClass } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
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
import { RouterOutlet } from '@angular/router';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, filter_module_name, messages, module_name } from 'app/security';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AgentsRMwiseService } from 'app/services/agents-rmwise.service';
import { Excel } from 'app/utils/export/excel';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { RefferralService } from 'app/services/referral.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-agent-rmwise',
    templateUrl: './agent-rmwise.component.html',
    styleUrls: ['./agent-rmwise.component.scss'],
    styles: [`
  .tbl-grid {
    grid-template-columns: 320px 90px 90px 90px 90px 90px;
  }
  `],
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
export class AgentRMWiseComponent extends BaseListingComponent implements OnDestroy {
    loading: boolean = false;
    dataList = [];
    total = 0;
    module_name = module_name.agents_rmwise
    filter_table_name = filter_module_name.report_rm_wise_agents;
    private settingsUpdatedSubscription: Subscription;
    leadFilter: any;
    isFilterShow: boolean = false;
    employeeList: any[] = [];
    selectedEmployee: string;
    selectedRM: any;

    columns = [
        { key: 'rm', name: 'RM', is_date: true, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
        { key: 'totalAgent', name: 'Total', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
        { key: 'total_New_Agent', name: 'New', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
        { key: 'total_Active_Agent', name: 'Active', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
        { key: 'total_Inactive_Agent', name: 'Inactive', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
        { key: 'total_Block_Agent', name: 'Blocked', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false }
    ]

    constructor(
        private agentsRMwiseService: AgentsRMwiseService,
        private refferralService: RefferralService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.agents_rmwise)
        // this.cols = this.columns.map(x => x.key);
        this.key = this.module_name;
        this.sortColumn = 'totalAgent';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit(): void {
        this.getEmployeeList("");
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.sortColumn = resp['sortColumn'];
            this.primengTable['_sortField'] = resp['sortColumn'];
            if(resp['table_config']['rm']){
                this.selectedRM = resp['table_config'].rm?.value;
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
            if(filterData['table_config']['rm']){
                this.selectedRM = filterData['table_config'].rm?.value;
            }
            this.primengTable['filters'] = filterData['table_config'];
        }
    }

    // cols = [];

    // getFilter(): any {
    //     const filterReq = GridUtils.GetFilterReq(
    //         this._paginator,
    //         this._sort,
    //         this.searchInputControl.value
    //     );
    //     return filterReq;
    // }

    refreshItems(event?: any): void {
        this.isLoading = true;
        this.agentsRMwiseService.rmwiseAgentsList(this.getNewFilterReq(event)).subscribe({
            next: (data) => {
                this.dataList = data.data;
                // this.total = data.total;
                this.totalRecords = data.total
                this.isLoading = false;
            }, error: (err) => {
                this.alertService.showToast('error', err)
                this.isLoading = false
            }
        });
    }

    // Api to get the Employee list data
    getEmployeeList(value: string) {
        this.refferralService.getEmployeeLeadAssignCombo(value).subscribe((data: any) => {
            this.employeeList = data;

            for (let i in this.employeeList) {
                this.employeeList[i].id_by_value = this.employeeList[i].employee_name
            }
        });
    }

    exportExcel(): void {
        if (!Security.hasExportDataPermission(module_name.agents_rmwise)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // const req = this.getFilter();
        // req.Skip = 0;
        // req.Take = this._paginator.length;
        const filterReq = this.getNewFilterReq({});
        filterReq['Take'] = this.totalRecords;
        // filterReq['Filter'] = this.searchInputControl.value ? this.searchInputControl.value : ""

        this.agentsRMwiseService.rmwiseAgentsList(filterReq).subscribe(data => {
            Excel.export(
                'RM Wise Agents',
                [
                    { header: 'RM', property: 'rm' },
                    { header: 'Total', property: 'totalAgent' },
                    { header: 'New', property: 'total_New_Agent' },
                    { header: 'Active', property: 'total_Active_Agent' },
                    { header: 'InActive', property: 'total_Inactive_Agent' },
                    { header: 'Block', property: 'total_Block_Agent' }
                ],
                data.data, "RM Wise Agents", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }]);
        });
    }

    getNodataText(): string {
        if (this.loading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    ngOnDestroy() {
        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }
}
