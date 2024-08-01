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
import { AppConfig } from 'app/config/app-config';
import { Security, agentPermissions, messages, module_name } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';
import { CRMDialCallEntryComponent } from '../dail-call-entry/dial-call-entry.component';
import { CallHistoryComponent } from '../call-history/call-history.component';
import { MarketingMaterialsComponent } from '../marketing-materials/marketing-materials.component';
import { CRMAgentTimelineComponent } from '../../timeline/agent-timeline/agent-timeline.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'inbox-agent',
    templateUrl: './inbox-agent.component.html',
    styles: [
        `
            .tbl-grid {
                grid-template-columns: 40px 60px 90px 90px 300px 190px 120px 120px 145px;
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
export class InboxAgentComponent {
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
            key: 'status',
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
            key: 'acCode',
            name: 'AC Code',
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
            key: 'agencyName',
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
            key: 'callPurpose',
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
            key: 'createdDate',
            name: 'Created Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false,
        },
        {
            key: 'latestDate',
            name: 'Last Login',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false,
            lastLogin: true,
            assignFlag: true
        },
        {
            key: 'lastTransaction',
            name: 'Last Transaction',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: false,
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

    @ViewChild(MatPaginator) public _paginatorInbox: MatPaginator;
    @ViewChild(MatSort) public _sortInbox: MatSort;

    Mainmodule: any;
    isLoading = false;
    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;

    module_name = module_name.crmagent
    total = 0;
    appConfig = AppConfig;
    data: any
    filter: any = {}
    formattedDate: string = '';


    constructor(
        private crmService: CrmService,
        private matDialog: MatDialog,
        private alertService: ToasterService,
        private conformationService: FuseConfirmationService

    ) {
        // super(module_name.lead);
        this.cols = this.columns.map(x => x.key);
        this.key = this.module_name;
        this.sortColumn = 'priorityid';
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
        this.crmService.getInboxAgentList(filterReq).subscribe({
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

    getLastLogin(item: any): any {
        const iosLogin = item.iosLastLogin ? new Date(item.iosLastLogin) : null;
        const androidLogin = item.androidLastLogin ? new Date(item.androidLastLogin) : null;
        const webLogin = item.webLastLogin ? new Date(item.webLastLogin) : null;

        // Check all dates are null
        // if (!iosLogin && !androidLogin && !webLogin) {
        //     return '-';
        // }
        const latestLogin = this.findLatestDate([iosLogin, androidLogin, webLogin]);
        return latestLogin;
    }

    findLatestDate(dates: (Date | null)[]): Date | null {
        let latestDate: Date | null = null;
        dates.forEach(date => {
            if (date && (!latestDate || date > latestDate)) {
                latestDate = date;
            }
        });
        return latestDate;
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
            return 'text-green-600';
        } else if (status == 'Active') {
            return 'text-blue-600';
        } else if (status == 'InActive') {
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
        if (!Security.hasPermission(agentPermissions.dailCallPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(CRMDialCallEntryComponent, {
            data: { data: record, readonly: true, agentDialCallFlag: true },
            disableClose: true,
        });
    }

    callHistory(record): void {
        if (!Security.hasPermission(agentPermissions.callHistoryPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        if (record?.callCount > 0) {
            this.matDialog.open(CallHistoryComponent, {
                data: { data: record, readonly: true },
                disableClose: true
            });
        }
    }

    marketingMaterials(record): void {
        if (!Security.hasPermission(agentPermissions.marketingMaterialPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        this.matDialog.open(MarketingMaterialsComponent, {
            data: { data: record, readonly: true },
            disableClose: true
        });
    }


    agentTimeline(record): void {
        // if (!Security.hasPermission(agentPermissions.dailCallPermissions)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }

        this.matDialog.open(CRMAgentTimelineComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    dormants(record): void {
        if (!Security.hasPermission(agentPermissions.dormantsPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Dormant';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to '
                    + label.toLowerCase() +
                    ' ' +
                    record.agencyName +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.crmService.dormant(record?.agentid).subscribe({
                        next: (res) => {
                            this.alertService.showToast('success', 'Dormant has been completed!', 'top-right', true);
                            this.refreshItems();
                        },
                        error: (err) => {
                            this.alertService.showToast(
                                'error',
                                err,
                                'top-right',
                                true
                            );
                        },
                    });
                }
            });
    }
}
