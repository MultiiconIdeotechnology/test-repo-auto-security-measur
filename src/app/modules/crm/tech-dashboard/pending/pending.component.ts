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
import { Security, filter_module_name, messages, module_name, techDashPermissions } from 'app/security';
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
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'app-crm-tech-dashboard-pending',
    templateUrl: './pending.component.html',
    styles: [],
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
    @Input() dropdownFirstCallObj: any;
    @ViewChild('tabGroup') tabGroup;
    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sortInbox: MatSort;

    Mainmodule: any;
    module_name = module_name.techDashboard;
    filter_table_name = filter_module_name.tech_dashboard_pending;
    private settingsUpdatedSubscription: Subscription;
    cols = [];
    dataList = [];
    getWLSettingList: any = [];
    searchInputControlPending = new FormControl('');
    deadLeadId: any;
    statusList = ['Pending', 'Inprocess', 'Delivered', 'Waiting for Customer Update', 'Waiting for Account Activation', 'Rejected from Store'];
    isLoading = false;
    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;
    total = 0;
    appConfig = AppConfig;
    data: any
    selectedAgent: any;
    agentList: any[] = [];
    filter: any = {}

    constructor(
        private crmService: CrmService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        private agentService: AgentService,
        public _filterService: CommonFilterService,
    ) {
        super(module_name.techDashboard);
        this.key = this.module_name;
        this.sortColumn = 'entry_date_time';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.agentList = this.dropdownFirstCallObj['agentList'];
        }, 1000);

        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.sortColumn = resp['sortColumn'];
            this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['integration_start_date_time'].value) {
                resp['table_config']['integration_start_date_time'].value = new Date(resp['table_config']['integration_start_date_time'].value);
            }
            if (resp['table_config']['entry_date_time'].value) {
                resp['table_config']['entry_date_time'].value = new Date(resp['table_config']['entry_date_time'].value);
            }
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShowPending = true;
            this.primengTable._filter();
        });
    }

    ngAfterViewInit() {
        // Defult Active filter show
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShowPending = true;
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);

            if (filterData['table_config']['integration_start_date_time'].value) {
                filterData['table_config']['integration_start_date_time'].value = new Date(filterData['table_config']['integration_start_date_time'].value);
            }
            if (filterData['table_config']['entry_date_time'].value) {
                filterData['table_config']['entry_date_time'].value = new Date(filterData['table_config']['entry_date_time'].value);
            }
            this.primengTable['filters'] = filterData['table_config'];
             this.agentList = this.dropdownFirstCallObj['agentList'];
        }
    }

    ngOnChanges() {
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

            for (let i in this.agentList) {
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`;
                this.agentList[i].id_by_value = this.agentList[i].agency_name;
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
        if (status == 'Pending') {
            return 'text-red-600';
        } else if (status == 'Inprocess') {
            return 'text-yellow-600';
        } else if (status == 'Delivered') {
            return 'text-green-600';
        } else if (status == 'Waiting for Customer Update') {
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

    ngOnDestroy(): void {

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }
}
