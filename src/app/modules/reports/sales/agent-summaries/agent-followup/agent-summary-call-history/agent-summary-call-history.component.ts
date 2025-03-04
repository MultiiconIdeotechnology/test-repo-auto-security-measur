import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, Input, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { AppConfig } from 'app/config/app-config';
import { CallHisoryRemarkComponent } from 'app/modules/crm/agent/call-history/call-history-remark/call-history-remark.component';
import { module_name } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-agent-summary-call-history',
    templateUrl: './agent-summary-call-history.component.html',
    standalone: true,
    styles: [
        `
    .tbl-grid {
        grid-template-columns: 160px 180px 155px 95px 80px 122px;
    }
`,
    ],
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        AsyncPipe,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatSlideToggleModule,
        NgxMatSelectSearchModule,
        MatTooltipModule,
        MatAutocompleteModule,
        RouterOutlet,
        MatOptionModule,
        MatDividerModule,
        MatSortModule,
        MatTableModule,
        MatPaginatorModule,
        MatMenuModule,
        MatDialogModule,
        CommonModule,
        MatTabsModule,
        MatCheckboxModule
    ]
})
export class AgentSummaryCallHistoryComponent {
    @Input() record:any;
    dataList = [];
    MasterId: any;
    searchInputControl = new FormControl('');
    @ViewChild('tabGroup') tabGroup;
    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sort: MatSort;

    title = "Call History";
    Mainmodule: any;
    isLoading = false;
    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;

    module_name = module_name.crmagent
    total = 0;
    appConfig = AppConfig;
    // data: any
    filter: any = {}
    is_schedule_call: FormControl;

    columns = [
        {
            key: 'entry_date_time',
            name: 'Date Time',
            is_date: true,
            date_formate: 'dd/MM/yyyy HH:mm:ss',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false,
        },
        {
            key: 'entry_by_id_Name',
            name: 'Call By',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: true,
            tooltip: true,
        },
        {
            key: 'call_purpose',
            name: 'Purpose',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true
        },
        {
            key: 'feedback',
            name: 'Feedback',
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
            key: 'rm_remark',
            name: 'Remark',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            shcheduleRemark: true
        },
        {
            key: 'is_call_rescheduled',
            name: 'Schedule Call',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
            scheduleCallFlag: true
        }
    ];
    cols = [];
    agencyName: any;

    constructor(
        private crmService: CrmService,
        private alertService: ToasterService,
        private matDialog: MatDialog,
    ) {
        this.key = this.module_name;
        this.Mainmodule = this;
    }

    ngOnInit(): void {
        this.searchInputControl.valueChanges
            .subscribe(() => {
                GridUtils.resetPaginator(this._paginator);
                // this.refreshItems();
            });
        this.refreshItems();
        this.is_schedule_call = new FormControl(true);
    }

    refreshItems(): void {
        this.isLoading = true;
        const filterReq = GridUtils.GetFilterReq(
            this._paginator,
            this._sort,
            this.searchInputControl.value, "entry_date_time", 1
        );
        let masterId = this.record?.agent_code_enc;
        filterReq['MasterId'] = masterId ? masterId : ""
        filterReq['MasterFor'] = "agent_signup"
        this.crmService.getCallHistoryList(filterReq).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                console.log("this.datalist", this.dataList);
                // this._paginator.length = data.total;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    remark(data: any) {
        
        this.matDialog.open(CallHisoryRemarkComponent, {
            data: {rm_remark:data},
            disableClose: true,
            panelClass: 'remark-dialog-container'
        }).afterClosed().subscribe(res => {
            if (!res) {
                return
            }
        })
    }
}
