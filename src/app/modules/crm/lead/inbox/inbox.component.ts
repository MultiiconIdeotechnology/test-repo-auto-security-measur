import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AppConfig } from 'app/config/app-config';
import { Security, leadPermissions, messages, module_name } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';
import { CRMDialCallEntryComponent } from '../dail-call-entry/dial-call-entry.component';
import { CRMScheduleCallEntryComponent } from '../schedule-call-entry/schedule-call-entry.component';
import { CallHistoryComponent } from '../call-history/call-history.component';
import { MarketingMaterialsComponent } from '../marketing-materials/marketing-materials.component';

@Component({
    selector: 'app-inbox',
    templateUrl: './inbox.component.html',
    styles: [
        `
            .tbl-grid {
                grid-template-columns: 40px 40px 280px 70px 140px 130px 100px 160px 90px 100px;
            }
        `,
    ],
    standalone: true,
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
        MatTabsModule
    ]
})
export class InboxComponent {
    columns = [
        {
            key: 'callCount',
            name: 'Calls',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            callAction: true
        },
        {
            key: 'agency_name',
            name: 'Agency',
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
            key: 'lead_status',
            name: 'Status',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
            toColor: true
        },
        {
            key: 'lead_type',
            name: 'Type',
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
            key: 'call_purpose',
            name: 'Purpose',
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
            key: 'last_call_date_time',
            name: 'Last Call',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: true,
        },
        {
            key: 'assignByName',
            name: 'Assigned By',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: true,
            assignFlag: true
        },
        {
            key: 'lead_source',
            name: 'Source',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: true,
        },
        {
            key: 'entry_date_time',
            name: 'Lead Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false,
        },
    ];
    cols = [];
    dataList = [];
    searchInputControlInbox = new FormControl('');
    @ViewChild('tabGroup') tabGroup;
    deadLeadId: any;

    @ViewChild(MatPaginator) public _paginatorInbox: MatPaginator;
    @ViewChild(MatSort) public _sortInbox: MatSort;

    Mainmodule: any;
    isLoading = false;
    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;

    module_name = module_name.lead
    total = 0;
    appConfig = AppConfig;
    data: any
    filter: any = {}

    constructor(
        private crmService: CrmService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        private alertService: ToasterService

    ) {
        // super(module_name.lead);
        this.cols = this.columns.map(x => x.key);
        this.key = this.module_name;
        this.sortColumn = 'priority_id';
        this.sortDirection = 'desc';
        this.Mainmodule = this
    }

    ngOnInit(): void {
        this.searchInputControlInbox.valueChanges
            .subscribe(() => {
                GridUtils.resetPaginator(this._paginatorInbox);
                this.refreshItems();
            });
        this.refreshItems();
    }

    refreshItems(): void {
        this.isLoading = true;
        const filterReq = GridUtils.GetFilterReq(
            this._paginatorInbox,
            this._sortInbox,
            this.searchInputControlInbox.value
        );
        this.crmService.getInboxLeadList(filterReq).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                this._paginatorInbox.length = data.total;
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
        else if (this.searchInputControlInbox.value)
            return `no search results found for \'${this.searchInputControlInbox.value}\'.`;
        else return 'No data to display';
    }

    getStatusColor(status: string): string {
        if (status == 'New') {
            return 'text-yellow-600';
        } else if (status == 'Live') {
            return 'text-green-600';
        } else if (status == 'Dead') {
            return 'text-red-600';
        } else {
            return '';
        }
    }

    getPriorityIndicatorClass(priority: string): string {
        if (priority == 'High') {
            return 'bg-red-600';
        } else if (priority == 'Medium') {
            return 'bg-yellow-600';
        } else {
            return 'bullet-pink';
        }
    }

    dialCall(record): void {
        if (!Security.hasPermission(leadPermissions.dailCallPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(CRMDialCallEntryComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    callHistory(record): void {
        if (!Security.hasPermission(leadPermissions.callHistoryPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        if (record?.callCount > 0) {
            this.matDialog.open(CallHistoryComponent, {
                data: { data: record, readonly: true },
                disableClose: true
            });
        }
    }

    scheduleCall(record): void {
        if (!Security.hasPermission(leadPermissions.scheduleCallPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(CRMScheduleCallEntryComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    startKycProcess(record): void {
        if (!Security.hasPermission(leadPermissions.startKYCProcessPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const newJson = {
            "id": "",
            "lead_id": record?.id
        }
        this.crmService.startKycProces(newJson).subscribe({
            next: (data) => {
                this.alertService.showToast('success', "Started KYC process", "top-right", true);
                this.isLoading = false;
                this.refreshItems();
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }

    modifyKycDetails(record): void {
        if (!Security.hasEditEntryPermission(module_name.lead)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        // window.open(`https://betab2b.bontonholidays.com/kyc-dashboard/` + record.id);
        // window.open(`https://betab2b.bontonholidays.com/kyc-dashboard/` + record?.enc_agent_leadid + `/email`);
        window.open(record?.url + `kyc-dashboard/` + record?.enc_agent_leadid + `/email`);
    }

    marketingMaterials(record): void {
        if (!Security.hasPermission(leadPermissions.marketingMaterialPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        this.matDialog.open(MarketingMaterialsComponent, {
            data: { data: record, readonly: true },
            disableClose: true
        });
    }

    deadLead(record, index): void {
        if (!Security.hasPermission(leadPermissions.deadLeadPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        this.deadLeadId = record?.id;
        const label: string = 'Dead Lead'
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + record?.agency_name + ' ?'
        }).afterClosed().subscribe({
            next: (res) => {
                if (res === 'confirmed') {
                    const newJson = {
                        id: this.deadLeadId
                    }
                    this.crmService.deadLead(newJson).subscribe({
                        next: (res) => {
                            if(res){
                                this.dataList.splice(index, 1);
                            }
                            this.alertService.showToast('success', "Dead Lead Successfully!", "top-right", true);
                            this.isLoading = false;
                        }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
                    });
                }
            }
        })
    }
}
