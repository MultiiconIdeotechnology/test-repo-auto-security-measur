import { filter_module_name, messages, module_name, Security } from 'app/security';
import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AppConfig } from 'app/config/app-config';
import { AccountService } from 'app/services/account.service';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { AgentService } from 'app/services/agent.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-first-transaction',
    templateUrl: './first-transaction.component.html',
    styles: [],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatProgressBarModule,
        MatMenuModule,
        MatDialogModule,
        MatDividerModule,
        FormsModule,
        PrimeNgImportsModule,
        MatTooltipModule
    ],
})
export class FirstTransactionComponent
    extends BaseListingComponent
    implements OnDestroy {
    module_name = module_name.firstTransaction;
    filter_table_name = filter_module_name.first_transaction;
    private settingsUpdatedSubscription: Subscription;
    dataList = [];
    total = 0;
    user: any;
    is_first: any;
    currentFilter: any;
    infoList = [];
    public Filter: any;
    public key: any = 'first_transaction_date_time';
    appConfig = AppConfig;
    settings: any;
    agentList: any[] = [];
    cols: Column[];
    isFilterShow: boolean = false;
    selectedAgent:any

    constructor(
        private accountService: AccountService,
        private agentService: AgentService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.firstTransaction);
        // this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'first_transaction_date_time';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name)
    }

    ngOnInit() {
        this.getAgent('');

          // common filter
          this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.selectedAgent = resp['table_config']['agency_name']?.value;
            if(this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                  this.agentList.push(this.selectedAgent);
                }
            }
            this.sortColumn = resp['sortColumn'];
            this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['first_transaction_date_time'].value && resp['table_config']['first_transaction_date_time'].value.length) {
                this._filterService.rangeDateConvert(resp['table_config']['first_transaction_date_time']);
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
            if (filterData['table_config']['first_transaction_date_time'].value && filterData['table_config']['first_transaction_date_time'].value.length) {
                this._filterService.rangeDateConvert(filterData['table_config']['first_transaction_date_time']);
            }
            this.primengTable['_sortField'] = filterData['sortColumn'];
            this.sortColumn = filterData['sortColumn'];
            this.primengTable['filters'] = filterData['table_config'];
        }
    }

    getAgent(value: string) {
        this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
            this.agentList = data;

            if(this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                  this.agentList.push(this.selectedAgent);
                }
            }

            for(let i in this.agentList){
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`;
                this.agentList[i].id_by_value = this.agentList[i].agency_name;
            }
        })
    }

    refreshItems(event?:any): void {
        this.accountService.getFirstTransaction(this.getNewFilterReq(event)).subscribe({
            next: (data) => {
                this.dataList = data.data;
                this.total = data.total;
                this.totalRecords = data.total;
                this.isLoading = false;
            },
            error: (err) => {
                this.alertService.showToast('error', err);
                this.isLoading = false;
            },
        });
    }

    getNodataText(): string {
        if (this.isLoading) return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    exportExcel(): void {
        if (!Security.hasExportDataPermission(this.module_name)) {
            return this.alertService.showToast(
                'error',
                messages.permissionDenied
            );
        }

        const filterReq = this.getNewFilterReq({});

        filterReq['Take'] = this.totalRecords;

        this.accountService.getFirstTransaction(filterReq).subscribe((data) => {
            for (var dt of data.data) {
                dt.first_transaction_date_time = DateTime.fromISO(dt.first_transaction_date_time).toFormat('dd-MM-yyyy hh:mm a');
                dt.address_line1 = dt.address_line1 ? (dt.address_line2 ? dt.address_line1 + ', ' + dt.address_line2 : dt.address_line1) : ''
                dt.gst_number = dt.gst_number ? dt.gst_number : dt.vat_number || ''
            }
            Excel.export(
                'First Transaction',
                [
                    { header: 'Transaction Date', property: 'first_transaction_date_time'},
                    { header: 'Agent Code', property: 'agent_code' },
                    { header: 'Agency Name', property: 'agency_name' },
                    { header: 'GST/VAT No', property: 'gst_number' },
                    { header: 'PAN', property: 'pan_number' },
                    { header: 'Country', property: 'country' },
                    { header: 'State', property: 'state_name' },
                    { header: 'Address ', property: 'address_line1' },
                    { header: 'Pincode', property: 'pincode' }
                ],
                data.data,
                'First Transaction',
                [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }]
            );
        });
    }

    ngOnDestroy(): void {
        // this.masterService.setData(this.key, this);

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }

}
