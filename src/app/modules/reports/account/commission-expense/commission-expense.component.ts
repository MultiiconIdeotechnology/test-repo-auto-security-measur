import { messages, module_name, Security } from 'app/security';
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
import { Linq } from 'app/utils/linq';
import { AgentService } from 'app/services/agent.service';

@Component({
    selector: 'app-commission-expense',
    templateUrl: './commission-expense.component.html',
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
        PrimeNgImportsModule
    ],
})
export class CommissionExpenseComponent
    extends BaseListingComponent
    implements OnDestroy {
    module_name = module_name.commissionExpense;
    dataList = [];
    tablesTotal: any;
    total = 0;
    user: any;
    is_first: any;
    currentFilter: any;
    infoList = [];
    public Filter: any;
    public key: any = 'booking_date';
    appConfig = AppConfig;
    settings: any;
    agentList: any[] = [];
    selectedAgent!:string

    columns = [
        {
            key: 'booking_date',
            name: 'Booking Date',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        },
        {
            key: 'booking_ref_no',
            name: 'Booking Ref. No.',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        },
        {
            key: 'agent_code',
            name: 'Agent Code',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
        },
        {
            key: 'agency_name',
            name: 'Agency Name',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        }
        ,{
            key: 'pnr',
            name: 'PNR',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        }
        ,{
            key: 'gds_pnr',
            name: 'GSD PNR',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        }
        ,{
            key: 'particular',
            name: 'Particular',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        }
        ,{
            key: 'commission',
            name: 'Commission',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        }
        ,{
            key: 'tds',
            name: 'TDS',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        }
        ,{
            key: 'net_commission',
            name: 'Net Commission',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        }
    ];


    cols: Column[];
    isFilterShow: boolean = false;

    constructor(
        private accountService: AccountService,
        private agentService: AgentService
    ) {
        super(module_name.commissionExpense);
        // this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'booking_date';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
    }

    ngOnInit() {
        this.getAgent('');
    }

    getAgent(value: string) {
        this.agentService.getAgentCombo(value).subscribe((data) => {
            this.agentList = data;

            for(let i in this.agentList){
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`
            }
        })
    }

    refreshItems(event?:any): void {
        this.accountService.getcommissionExpense(this.getNewFilterReq(event)).subscribe({
            next: (data) => {
                this.dataList = data.data;
                this.tablesTotal = data.totals;
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

    ngOnDestroy(): void {
        // this.masterService.setData(this.key, this);
    }

    viewData(record): void {
        // if (!Security.hasViewDetailPermission(module_name.bookingsFlight)) {
        //     return this.alertService.showToast(
        //         'error',
        //         messages.permissionDenied
        //     );
        // }

        if (record?.booking_ref_no?.substring(0, 3) == 'FLT') {
            Linq.recirect('/booking/flight/details/' + record.service_for_id);
        }
        else if (record?.booking_ref_no?.substring(0, 3) == 'VIS') {
            Linq.recirect('/booking/visa/details/' + record.service_for_id);
        }
        else if (record?.booking_ref_no?.substring(0, 3) == 'BUS') {
            Linq.recirect('/booking/bus/details/' + record.service_for_id);
        }
        else if (record?.booking_ref_no?.substring(0, 3) == 'HTL') {
            Linq.recirect('/booking/hotel/details/' + record.service_for_id);
        }
        else if (record?.booking_ref_no?.substring(0, 3) == 'AGI') {
            Linq.recirect('/booking/group-inquiry/details/' + record.service_for_id);
        }
        else if (record?.booking_ref_no?.substring(0, 3) == 'OSB') {
            Linq.recirect('/booking/offline-service/entry/' + record.service_for_id + '/readonly');
        }
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
        this.accountService.getcommissionExpense(filterReq).subscribe((data) => {
            for (var dt of data.data) {
                dt.booking_date = DateTime.fromISO(dt.booking_date).toFormat('dd-MM-yyyy hh:mm a');
            }
            Excel.export(
                'Commission Expense',
                [
                    { header: 'Booking Date', property: 'booking_date'},
                    { header: 'Booking Ref. No.', property: 'booking_ref_no' },
                    { header: 'Agent Code', property: 'agent_code' },
                    { header: 'Agency Name', property: 'agency_name' },
                    { header: 'PNR', property: 'pnr' },
                    { header: 'GSD PNR', property: 'gds_pnr' },
                    { header: 'Particular', property: 'particular' },
                    { header: 'Commission', property: 'commission' },
                    { header: 'TDS ', property: 'tds' },
                    { header: 'Net Commission', property: 'net_commission' }
                ],
                data.data,
                'Commission Expense',
                [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }]
            );
        });
    }
}
