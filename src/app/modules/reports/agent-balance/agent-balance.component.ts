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
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, messages, module_name } from 'app/security';
import { Excel } from 'app/utils/export/excel';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { DateTime } from 'luxon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentService } from 'app/services/agent.service';
import { AgentBalanceService } from 'app/services/agent-balance.service';
import { RefferralService } from 'app/services/referral.service';


@Component({
    selector: 'app-agent-balance',
    templateUrl: './agent-balance.component.html',
    styleUrls: ['./agent-balance.component.scss'],
    styles: [`
  .tbl-grid {
    grid-template-columns: 40px 240px 100px 110px 110px 180px 130px 200px 180px;
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
export class AgentBalanceComponent extends BaseListingComponent implements OnDestroy {

    dataList = [];
    total = 0;
    module_name = module_name.agentBalance;
    isFilterShow: boolean = false;
    agentList: any[] = [];
    employeeList: any[] = [];
    selectedRM!: string;

    constructor(
        private agentBalanceService: AgentBalanceService,
        private agentService: AgentService,
        private refferralService: RefferralService,
        // private clipboard: Clipboard
    ) {
        super(module_name.agentBalance)
        // this.cols = this.columns.map(x => x.key);
        this.key = 'payment_request_date';
        this.sortColumn = 'last_top_up';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
    }

    ngOnInit(): void {
        this.getAgent('');
        this.getEmployeeList("")
    }

    // Api to get the Employee list data
    getEmployeeList(value: string) {
        this.refferralService.getEmployeeLeadAssignCombo(value).subscribe((data: any) => {
            this.employeeList = data;
        });
    }

    columns = [
        { key: 'agent_name', name: 'Agent', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: true, is_boolean: false, tooltip: true, isview: true },
        { key: 'balance', name: 'Balance', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true, iscolor: false, isFix: true },
        { key: 'credit', name: 'Credit', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true, isFix: true },
        { key: 'rm', name: 'RM', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
        { key: 'mobile', name: 'Mobile', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, isamount: true },
        { key: 'email', name: 'Email', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
        { key: 'last_top_up', name: 'Last Top-up', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    ]
    // cols = [];

    refreshItems(event?: any): void {
        this.isLoading = true;
        this.agentBalanceService.getWalletReportList(this.getNewFilterReq(event)).subscribe({
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

    getAgent(value: string) {
        this.agentService.getAgentCombo(value).subscribe((data) => {
            this.agentList = data;

          for(let i in this.agentList){
            this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`
          }
        })
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
        // const filterReq = {};
        // filterReq['filter_date_by'] = this.saleFilter?.filter_date_by || 'BookingDate';
        // filterReq['service'] = this.saleFilter?.service || 'All';
        // filterReq['date'] = this.saleFilter.date || 'Last Month';
        // filterReq['agent_id'] = this.saleFilter?.agent_id?.id || 'All';
        // filterReq['billing_company_id'] = this.saleFilter?.billing_company_id.id || 'All';
        // filterReq['from_date'] = DateTime.fromJSDate(this.saleFilter.FromDate).toFormat('yyyy-MM-dd');
        // filterReq['to_date'] = DateTime.fromJSDate(this.saleFilter.ToDate).toFormat('yyyy-MM-dd');

        this.agentBalanceService.getWalletReportList(req).subscribe(data => {
            for (var dt of data.data) {
                dt.last_top_up = DateTime.fromISO(dt.last_top_up).toFormat('dd-MM-yyyy hh:mm a')
                dt.balance = dt.currency + ' ' + dt.balance
            }
            Excel.export(
                'Agent Balance Register',
                [
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

}
