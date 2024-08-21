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
import { RouterOutlet, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { filter_module_name, messages, module_name, Security } from 'app/security';
import { WalletOutstandingService } from 'app/services/wallet-outstanding.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { AgentService } from 'app/services/agent.service';
import { RefferralService } from 'app/services/referral.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'app-wallet-outstanding-list',
    templateUrl: './wallet-outstanding-list.component.html',
    styleUrls: ['./wallet-outstanding-list.component.scss'],
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
export class WalletOutstandingListComponent extends BaseListingComponent implements OnDestroy {

    module_name = module_name.walletOutstanding;
    filter_table_name = filter_module_name.wallet_outstanding;
    private settingsUpdatedSubscription: Subscription;
    dataList = [];
    total = 0;
    isFilterShow: boolean = false;
    agentList: any[] = [];
    selectedAgent!: string;
    employeeList: any[] = [];
    selectedRM!: string;

    constructor(
        private agentService: AgentService,
        private refferralService: RefferralService,
        private walletOutstandingService: WalletOutstandingService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.walletOutstanding)
        this.key = 'payment_request_date';
        this.sortColumn = 'due_date';
        this.sortDirection = 'asc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit(): void {
        this.getAgent('');
        this.getEmployeeList("");

        // common filter
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.sortColumn = resp['sortColumn'];
            this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['due_date'].value && resp['table_config']['due_date'].value.length) {
                this._filterService.rangeDateConvert(resp['table_config']['due_date']);
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
            if (filterData['table_config']['due_date'].value && filterData['table_config']['due_date'].value.length) {
                this._filterService.rangeDateConvert(filterData['table_config']['due_date']);
            }
            this.primengTable['_sortField'] = filterData['sortColumn'];
            this.sortColumn = filterData['sortColumn'];
            this.primengTable['filters'] = filterData['table_config'];
        }
    }

    getAgent(value: string) {
        this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
            this.agentList = data;

            for(let i in this.agentList){
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`;
                this.agentList[i].id_by_value = this.agentList[i].agency_name; 
            }
        })
    }

    // Api to get the Employee list data
    getEmployeeList(value: string) {
        this.refferralService.getEmployeeLeadAssignCombo(value).subscribe((data: any) => {
            this.employeeList = data;

            // pass by value variable added to common named variable(id_by_value) for common filter
            for (let i in this.employeeList) {
                this.employeeList[i].id_by_value = this.employeeList[i].employee_name
            }
        });
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        this.walletOutstandingService.getWalletOutstanding(this.getNewFilterReq(event)).subscribe({
            next: (data) => {
                this.dataList = data.data;
                // this.total = data.total;
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

    exportExcel(event): void {
        if (!Security.hasExportDataPermission(module_name.walletOutstanding)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.walletOutstandingService.getWalletOutstanding(this.getNewFilterReq(event)).subscribe(data => {
            for (var dt of data.data) {
                dt.due_date = DateTime.fromISO(dt.due_date).toFormat('dd-MM-yyyy hh:mm a');
            }
            Excel.export(
                'Wallet Outstanding',
                [
                    { header: 'Agent Code', property: 'agentid' },
                    { header: 'Agent', property: 'agency_name' },
                    { header: 'Outstanding', property: 'outstanding_on_due_date' },
                    { header: 'RM', property: 'employee_name' },
                    { header: 'Mobile', property: 'mobile_number' },
                    { header: 'Email', property: 'email_address' },
                    { header: 'Credit', property: 'credit_balance' },
                    { header: 'Payment Cycle', property: 'payment_cycle_policy' },
                    { header: 'Payment Policy', property: 'payment_cycle_policy_type' },
                    { header: 'Due Date', property: 'due_date' },
                    { header: 'Over Due Count', property: 'over_due_count' }
                ],
                data.data, "Wallet Outstanding", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }]);
        });
    }

    ngOnDestroy(): void {

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }

}
