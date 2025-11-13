import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
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
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';
import { PendingUpdateStatusComponent } from '../pending-update-status/pending-update-status.component';
import { PendingWLSettingComponent } from '../pending-wl-setting/pending-wl-setting.component';
import { techDashboardStatusChangedLogComponent } from '../techdashboard-status-changed-log/techdashboard-status-changed-log.component';
import { PendingLinkComponent } from '../pending-link/pending-link.component';
import { TechInfoTabsComponent } from '../info-tabs/info-tabs.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { AgentService } from 'app/services/agent.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { GlobalSearchService } from 'app/services/global-search.service';
import { DomainSslVerificationComponent } from '../domain-ssl-verification/domain-ssl-verification.component';
import { MobileProductActivateDialogComponent } from '../domain-ssl-verification/mobile-product-activate-dialog/mobile-product-activate-dialog.component';
import { OverlayPanel } from 'primeng/overlaypanel';
import { cloneDeep } from 'lodash';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';

@Component({
    selector: 'app-crm-tech-dashboard-pending',
    templateUrl: './pending.component.html',
    styleUrls: ['./pending.component.scss'],
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
    @Output() isFilterShowPendingChange = new EventEmitter<boolean>();
    @Input() dropdownFirstCallObj: any;
    @ViewChild('tabGroup') tabGroup;
    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sortInbox: MatSort;
    @ViewChild('op') overlayPanel!: OverlayPanel;

    Mainmodule: any;
    module_name = module_name.techDashboard;
    filter_table_name = filter_module_name.tech_dashboard_pending;
    private settingsUpdatedSubscription: Subscription;
    dataList = [];
    getWLSettingList: any = [];
    searchInputControlPending = new FormControl('');
    deadLeadId: any;
    statusList = ['Pending', 'Inprocess', 'Delivered', 'Google Closed Testing', 'Waiting for Customer Update', 'Waiting for Account Activation', 'Rejected from Store',];
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

    types = Types;
    exportCol: Column[] = [];
    activeFiltData: any = {};
    cols: Column[] = [];
    selectedColumns: Column[] = [];

    constructor(
        private crmService: CrmService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        private agentService: AgentService,
        public _filterService: CommonFilterService,
        public globalSearchService: GlobalSearchService
    ) {
        super(module_name.techDashboard);
        this.key = this.module_name;
        this.sortColumn = 'entryDateTime';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);

        this.selectedColumns = [
            { field: 'itemCode', header: 'Item Code', type: Types.text },
            { field: 'itemName', header: 'Item', type: Types.select },
            { field: 'productName', header: 'Product', type: Types.select },
            { field: 'productServiceStatus', header: 'Status', type: Types.select, isCustomColor: true },
            { field: 'agentCode', header: 'Agent Code', type: Types.number, fixVal: 0 },
            { field: 'agencyName', header: 'Agency Name', type: Types.select },
            { field: 'startIntegrationDateTime', header: 'Start Int. Date', type: Types.date, dateFormat: 'dd-MM-yyyy' },
            { field: 'entryDateTime ', header: 'Entry Date', type: Types.date, dateFormat: 'dd-MM-yyyy' }
        ];

        this.cols.unshift(...this.selectedColumns);
        this.exportCol = cloneDeep(this.cols);
    }

    ngOnInit(): void {
        this.agentList = this._filterService.agentListByValue;

        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.selectedAgent = resp['table_config']['agencyName']?.value;
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['startIntegrationDateTime'].value) {
                resp['table_config']['startIntegrationDateTime'].value = new Date(resp['table_config']['startIntegrationDateTime'].value);
            }
            if (resp['table_config']['entryDateTime'].value) {
                resp['table_config']['entryDateTime'].value = new Date(resp['table_config']['entryDateTime'].value);
            }
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShowPending = true;
            this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns);
            this.isFilterShowPendingChange.emit(this.isFilterShowPending);
            this.primengTable._filter();
        });
    }

    ngAfterViewInit() {
        // Defult Active filter show
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShowPending = true;
            this.isFilterShowPendingChange.emit(this.isFilterShowPending);
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            setTimeout(() => {
                this.selectedAgent = filterData['table_config']['agencyName']?.value;
                if (this.selectedAgent && this.selectedAgent.id) {
                    const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                    if (!match) {
                        this.agentList.push(this.selectedAgent);
                    }
                }
            }, 1000);

            if (filterData['table_config']['startIntegrationDateTime'].value) {
                filterData['table_config']['startIntegrationDateTime'].value = new Date(filterData['table_config']['startIntegrationDateTime'].value);
            }
            if (filterData['table_config']['entryDateTime'].value) {
                filterData['table_config']['entryDateTime'].value = new Date(filterData['table_config']['entryDateTime'].value);
            }
            this.primengTable['filters'] = filterData['table_config'];
            this.selectedColumns = this.checkSelectedColumn(filterData['selectedColumns'] || [], this.selectedColumns);
            this.onColumnsChange();
        } else {
            this.selectedColumns = this.checkSelectedColumn([], this.selectedColumns);
            this.onColumnsChange();
        }
    }

    onColumnsChange(): void {
        this._filterService.setSelectedColumns({ name: this.filter_table_name, columns: this.selectedColumns });
    }

    checkSelectedColumn(col: any[], oldCol: Column[]): any[] {
        if (col.length) return col
        else {
            var Col = this._filterService.getSelectedColumns({ name: this.filter_table_name })?.columns || [];
            if (!Col.length)
                return oldCol;
            else
                return Col;
        }
    }

    isDisplayHashCol(): boolean {
        return this.selectedColumns.length > 0;
    }


    toggleOverlayPanel(event: MouseEvent) {
        this.overlayPanel.toggle(event);
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        const filterReq = this.getNewFilterReq(event);
        filterReq['Filter'] = this.searchInputControlPending.value;

        this.crmService.getPendingProductList(filterReq).subscribe({
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
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agencyName}-${this.agentList[i].email_address}`;
                this.agentList[i].id_by_value = this.agentList[i].agencyName;
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
        if (status == 'Sales Return' || status == 'Cancelled' || status == 'Expired' || status == 'Blocked' || status == 'Rejected from Store') {
            return 'text-red-600';
        } else if (status == 'Inprocess' || status == 'Google Closed Testing') {
            return 'text-yellow-600';
        } else if (status == 'Delivered') {
            return 'text-green-600';
        } else if (status == 'Waiting for Customer Update' || status == 'Pending' || status == 'Waiting for Account Activation') {
            return 'text-blue-600';
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

    // wlSetting(record): void {
    //     if (!Security.hasPermission(techDashPermissions.wlSettingPermissions)) {
    //         return this.alertService.showToast('error', messages.permissionDenied);
    //     }

    //     this.crmService.getWLSettingList(record?.code).subscribe({
    //         next: (data) => {
    //             this.isLoading = false;
    //             this.getWLSettingList = data[0];

    //             this.matDialog.open(PendingWLSettingComponent, {
    //                 data: { data: record, wlsetting: this.getWLSettingList },
    //                 disableClose: true,
    //             });
    //         },
    //         error: (err) => {
    //             this.alertService.showToast('error', err, 'top-right', true);
    //             this.isLoading = false;
    //         },
    //     });
    // }

    wlSetting(record: any) {
        if (!Security.hasPermission(techDashPermissions.wlSettingPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        
        this.crmService.getWLSettingListTwoParams(record?.agentId, record?.itemName).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.getWLSettingList = data[0];

                this.matDialog.open(DomainSslVerificationComponent, {
                    disableClose: true,
                    data: { record: record, wlSettingList: this.getWLSettingList, from: 'pending' },
                    panelClass: ['custom-dialog-modal-md'],
                    autoFocus: false,
                }).afterClosed().subscribe((res: any) => {
                    if (res && res == 'pending') {
                        this.refreshItems();
                    }
                })
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
                        Id: record.id,
                        IsStartIntegration: true
                    }
                    this.crmService.startIntegration(newJson).subscribe({
                        next: (res) => {
                            if (res) {
                                this.alertService.showToast(
                                    'success',
                                    'Start Integration Successfully!',
                                    'top-right',
                                    true
                                );
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

        this.crmService.getWLSettingListTwoParams(record?.agentId, record?.itemName).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.getWLSettingList = data[0];

                this.matDialog.open(MobileProductActivateDialogComponent, {
                    disableClose: true,
                    data: { record: record, getWLSettingList: this.getWLSettingList, index: index },
                    panelClass: ['zero-dialog'],
                    autoFocus: false,
                    width: '573px',
                }).afterClosed().subscribe((res: any) => {
                    if (res && res == 'pending') {
                        this.refreshItems();
                    }
                });
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }

    getWlSettingList(record: any, index: any) {
        this.crmService.getWLSettingList(record?.code).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.getWLSettingList = data;
                const isRiseProduct = record?.itemName?.toLowerCase().includes('rise');
                if (isRiseProduct || (this.getWLSettingList && this.getWLSettingList.length > 0)) {
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
                                    ServiceId: record.id ? record.id : "",
                                    // is_activated: true,
                                    AgentId: record?.agentid ? record?.agentid : ""
                                }
                                this.crmService.activate(newJson).subscribe({
                                    next: (res) => {
                                        if (res) {
                                            this.alertService.showToast(
                                                'success',
                                                'Product activated Successfully!',
                                                'top-right',
                                                true
                                            );
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

    googleClosedTesting(record: any) {
        const label: string = 'Google Closed Testing';
        this.conformationService
            .open({
                title: label,
                message:
                    'Do you want to set status as google closed testing?'
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    let newJson = {
                        id: record.id,
                    }
                    this.crmService.googleClosedTesting(newJson).subscribe({
                        next: (res) => {
                            if (res) {
                                this.alertService.showToast('success', 'Google closed testing successfully!');
                                this.refreshItems();
                            }
                        },
                        error: (err) => {
                            this.alertService.showToast('error', err);
                        },
                    });
                }
            });
    }

    exportExcel(event?: any): void {
        if (!Security.hasExportDataPermission(this.module_name)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        const filterReq = this.getNewFilterReq(event);
        filterReq['Filter'] = this.searchInputControlPending.value;
        filterReq['Take'] = this.totalRecords;

        this.crmService.getPendingProductList(filterReq).subscribe(data => {
            for (var dt of data.data) {
                dt.startIntegrationDateTime = dt.startIntegrationDateTime ? DateTime.fromISO(dt.startIntegrationDateTime).toFormat('dd-MM-yyyy') : ''
                dt.entryDateTime = dt.entryDateTime ? DateTime.fromISO(dt.entryDateTime).toFormat('dd-MM-yyyy') : ''
            }
            Excel.export(
                'Pending',
                [
                    { header: 'Item Code', property: 'itemCode' },
                    { header: 'Item', property: 'itemName' },
                    { header: 'Product', property: 'productName' },
                    { header: 'Status', property: 'productServiceStatus' },
                    { header: 'Agent Code', property: 'agentCode' },
                    { header: 'Agency Name', property: 'agencyName' },
                    { header: 'Start Int. Date', property: 'startIntegrationDateTime' },
                    { header: 'Entry Date', property: 'entryDateTime' },
                ],
                data.data, "Pending", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }]);
        });
    }

    ngOnDestroy(): void {

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }

    displayColCount(): number {
        return this.selectedColumns.length + 1;
    }

    isValidDate(value: any): boolean {
        const date = new Date(value);
        return value && !isNaN(date.getTime());

    }
}
