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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
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
    selector: 'app-lead-rmwise',
    templateUrl: './lead-rmwise.component.html',
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
export class LeadRMWiseComponent extends BaseListingComponent implements OnDestroy {
    loading: boolean = false;
    dataList = [];
    // total = 0;
    module_name = module_name.leads_rmwise
    filter_table_name = filter_module_name.leads_rm_wise_leads;
    private settingsUpdatedSubscription: Subscription;
    leadFilter: any;
    isFilterShow: boolean = false;
    employeeList: any[] = [];
    selectedRM: any;

    columns = [
        { key: 'rm', name: 'RM', is_date: true, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
        { key: 'totallead', name: 'Total', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
        { key: 'total_New_lead', name: 'New', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
        { key: 'total_Live_lead', name: 'Live', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
        { key: 'total_Converted_lead', name: 'Converted', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
        { key: 'total_Dead_lead', name: 'Dead', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false }
    ]
    cols = [];

    constructor(
        private agentsRMwiseService: AgentsRMwiseService,
        private refferralService: RefferralService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.leads_rmwise)
        this.cols = this.columns.map(x => x.key);
        this.key = this.module_name;
        this.sortColumn = 'totallead';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit(): void {
        this.getEmployeeList("");
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
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
            this.selectedRM = filterData['table_config']['rm']?.value;
            if(filterData['table_config']['rm']){
                this.selectedRM = filterData['table_config'].rm?.value;
            }
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
            this.primengTable['filters'] = filterData['table_config'];
        }
    }

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
        this.agentsRMwiseService.rmwiseLeadsList(this.getNewFilterReq(event)).subscribe({
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
        if (!Security.hasExportDataPermission(module_name.leads_rmwise)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // const req = this.getFilter();
        // const req = {};
        // req['Skip'] = 0;
        // req['Take'] = this.totalRecords;
        const filterReq = this.getNewFilterReq({});
        filterReq['Take'] = this.totalRecords;
        // filterReq['Filter'] = this.searchInputControl.value ? this.searchInputControl.value : ""

        this.agentsRMwiseService.rmwiseLeadsList(filterReq).subscribe(data => {
            Excel.export(
                'RM Wise Leads',
                [
                    { header: 'RM', property: 'rm' },
                    { header: 'Total', property: 'totallead' },
                    { header: 'New', property: 'total_New_lead' },
                    { header: 'Live', property: 'total_Live_lead' },
                    { header: 'Converted', property: 'total_Converted_lead' },
                    { header: 'Dead', property: 'total_Dead_lead' }
                ],
                data.data, "RM Wise Leads", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }]);
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
