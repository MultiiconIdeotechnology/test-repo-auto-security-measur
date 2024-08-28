import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
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
import { Security, messages, module_name, techDashPermissions } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';
import { PendingUpdateStatusComponent } from '../pending-update-status/pending-update-status.component';
import { PendingWLSettingComponent } from '../pending-wl-setting/pending-wl-setting.component';
import { techDashboardStatusChangedLogComponent } from '../techdashboard-status-changed-log/techdashboard-status-changed-log.component';
import { PendingLinkComponent } from '../pending-link/pending-link.component';
import { TechInfoTabsComponent } from '../info-tabs/info-tabs.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { AgentService } from 'app/services/agent.service';

@Component({
    selector: 'app-crm-tech-dashboard-pending',
    templateUrl: './pending.component.html',
    styles: [
        `
            .tbl-grid {
                grid-template-columns: 40px 100px 150px 150px 230px 110px 200px 140px 250px;
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
        MatTabsModule,
        TechInfoTabsComponent,
        PrimeNgImportsModule
    ]
})
export class TechDashboardPendingComponent extends BaseListingComponent {
    @Input() isFilterShowPending: boolean;
    @Input() dropdownFirstCallObj:any;
    columns = [
        {
            key: 'item_code',
            name: 'Item Code',
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
            key: 'item_name',
            name: 'Item',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: true,
            tooltip: false
        },
        {
            key: 'product_name',
            name: 'Product',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: true,
            tooltip: false
        },
        {
            key: 'product_status',
            name: 'Status',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            toColor: true
        },
        {
            key: 'agentCode',
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
            indicator: true,
            tooltip: true
        },
        {
            key: 'integration_start_date_time',
            name: 'Start Int. Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false
        },
        {
            key: 'entry_date_time',
            name: 'Entry Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false
        },
        // {
        //     key: 'special_status_remark',
        //     name: 'RM Remark',
        //     is_date: false,
        //     date_formate: '',
        //     is_sortable: true,
        //     class: '',
        //     is_sticky: false,
        //     align: 'center',
        //     indicator: false,
        //     tooltip: true
        // }
    ];
    cols = [];
    dataList = [];
    getWLSettingList: any = [];
    searchInputControlPending = new FormControl('');
    @ViewChild('tabGroup') tabGroup;
    deadLeadId: any;
    statusList = [ 'Pending', 'Inprocess', 'Delivered','Waiting for Customer Update','Waiting for Account Activation','Rejected from Store'];

    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sortInbox: MatSort;

    Mainmodule: any;
    isLoading = false;
    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;

    module_name = module_name.techDashboard
    total = 0;
    appConfig = AppConfig;
    data: any
    selectedAgent:string;
    agentList:any[] = [];
    filter: any = {}

    constructor(
        private crmService: CrmService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        private agentService: AgentService
    ) {
        super(module_name.techDashboard);
        this.cols = this.columns.map(x => x.key);
        this.key = this.module_name;
        this.sortColumn = 'entry_date_time';
        this.sortDirection = 'desc';
        this.Mainmodule = this
    }

    ngOnInit(): void {
        // this.searchInputControlPending.valueChanges
        //     .subscribe(() => {
        //         GridUtils.resetPaginator(this._paginator);
        //         this.refreshItems();
        //     });
        // this.refreshItems();

        // this.searchInputControlPending.valueChanges
        //     .subscribe(() => {
        //         // GridUtils.resetPaginator(this._paginatorPending);
        //         // this.refreshItems();
        //     });

    }

    ngOnChanges(){
        this.agentList = this.dropdownFirstCallObj['agentList'];
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        const filterReq = this.getNewFilterReq(event);
        filterReq['Filter'] = this.searchInputControlPending.value;

        this.crmService.getTechProductList(filterReq).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                this.totalRecords = data.total;
                // this._paginator.length = data.total;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }

      // Api call to Get Agent data
    getAgent(value: string) {
        this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
            this.agentList = data;

            for(let i in this.agentList){
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`
            }
        })
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControlPending.value)
            return `no search results found for \'${this.searchInputControlPending.value}\'.`;
        else return 'No data to display';
    }

    getStatusColor(status: string): string {
        if (status == 'Sales Return' || status == 'Cancelled') {
            return 'text-red-600';
        } else if (status == 'Inprocess') {
            return 'text-yellow-600';
        } else if (status == 'Delivered') {
            return 'text-green-600';
        } else if (status == 'Waiting for Customer Update' || status == 'Pending') {
            return 'text-blue-600';
        } else if (status == 'Waiting for Account Activation') {
            return 'text-blue-600';
        } else if (status == 'Rejected from Store') {
            return 'text-red-600';
        }
        else {
            return '';
        }
    }

    updateStatus(record): void {
        if (!Security.hasPermission(techDashPermissions.updateStatusPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(PendingUpdateStatusComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        }).afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.alertService.showToast(
                        'success',
                        'Update status successfully!',
                        'top-right',
                        true
                    );
                    this.refreshItems();
                }
            });
    }

    statusChangedLog(record): void {
        if (!Security.hasPermission(techDashPermissions.statusChangedLogPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        this.matDialog.open(techDashboardStatusChangedLogComponent, {
            data: { data: record },
            disableClose: true
        });
    }

    wlSetting(record): void {
        if (!Security.hasPermission(techDashPermissions.wlSettingPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.crmService.getWLSettingList(record?.code).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.getWLSettingList = data[0];

                this.matDialog.open(PendingWLSettingComponent, {
                    data: { data: record, wlsetting: this.getWLSettingList },
                    disableClose: true,
                });
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }

    link(record): void {
        if (!Security.hasPermission(techDashPermissions.linkPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(PendingLinkComponent, {
            data: { data: record },
            disableClose: true,
        });
    }

    viewDetail(record): void {
        this.matDialog.open(TechInfoTabsComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    startIntegration(record): void {
        // if (!Security.hasPermission(agentsPermissions.removeAllSubagentPermissions)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }

        const label: string = 'Start Integration';
        this.conformationService
            .open({
                title: label,
                message:
                    'Do you want to start integration?'
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    let newJson = {
                        id: record.id,
                        is_integration_started: true
                    }
                    this.crmService.startIntegration(newJson).subscribe({
                        next: (res) => {
                            this.alertService.showToast(
                                'success',
                                'Start Integration Successfully!',
                                'top-right',
                                true
                            );
                            if (res) {
                                this.refreshItems();
                            }
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

    activate(record, index): void {
        // if (!Security.hasPermission(agentsPermissions.removeAllSubagentPermissions)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }

        this.crmService.getWLSettingList(record?.code).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.getWLSettingList = data;

                if (this.getWLSettingList && this.getWLSettingList.length > 0) {
                    const label: string = 'Activate';
                    this.conformationService
                        .open({
                            title: label,
                            message:
                                'Do you want to activate?'
                        })
                        .afterClosed()
                        .subscribe((res) => {
                            if (res === 'confirmed') {
                                let newJson = {
                                    id: record.id ? record.id : "",
                                    is_activated: true,
                                    agent_id: record?.agentid ? record?.agentid : ""
                                }
                                this.crmService.activate(newJson).subscribe({
                                    next: (res) => {
                                        this.alertService.showToast(
                                            'success',
                                            'Product activated Successfully!',
                                            'top-right',
                                            true
                                        );
                                        if (res) {
                                            this.dataList.splice(index, 1);
                                        }
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
                } else {
                    this.alertService.showToast('error', 'WL not found ', 'top-right', true);
                }
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }
}
