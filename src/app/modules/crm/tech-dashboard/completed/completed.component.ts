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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { AppConfig } from 'app/config/app-config';
import { Security, filter_module_name, messages, module_name, techDashPermissions } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';
import { PendingWLSettingComponent } from '../pending-wl-setting/pending-wl-setting.component';
import { TechInfoTabsComponent } from '../info-tabs/info-tabs.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { DateTime } from 'luxon';
import { AgentService } from 'app/services/agent.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { GlobalSearchService } from 'app/services/global-search.service';
import { DomainSslVerificationComponent } from '../domain-ssl-verification/domain-ssl-verification.component';
import { cloneDeep } from 'lodash';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Excel } from 'app/utils/export/excel';

@Component({
    selector: 'app-crm-tech-dashboard-completed',
    templateUrl: './completed.component.html',
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
        MatProgressBarModule,
        TechInfoTabsComponent,
        PrimeNgImportsModule
    ]
})
export class TechDashboardCompletedComponent extends BaseListingComponent {
    @Input() isFilterShowCompleted: boolean;
    @Output() isFilterShowCompletedChange = new EventEmitter<boolean>();
    @ViewChild('tabGroup') tabGroup;
    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sortArchive: MatSort;
    @ViewChild('op') overlayPanel!: OverlayPanel;

    Mainmodule: any;
    module_name = module_name.techDashboard;
    filter_table_name = filter_module_name.tech_dashboard_completed;
    private settingsUpdatedSubscription: Subscription;
    total = 0;
    dataList: any;
    appConfig = AppConfig;
    isLoading: any;
    getWLSettingList = [];
    searchInputControlCompleted = new FormControl('');
    data: any;
    selectedAgent: any;
    agentList: any[] = [];
    filter: any = {}

    types = Types;
    exportCol: Column[] = [];
    activeFiltData: any = {};
    cols: Column[] = [];
    selectedColumns: Column[] = [];

    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;

    constructor(
        private crmService: CrmService,
        private matDialog: MatDialog,
        private conformationService: FuseConfirmationService,
        private agentService: AgentService,
        public _filterService: CommonFilterService,
        public globalSearchService: GlobalSearchService
    ) {
        super(module_name.techDashboard);
        this.key = this.module_name;
        this.sortColumn = 'activationDate';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
        this.selectedColumns = [
            { field: 'itemCode', header: 'Item Code', type: Types.text },
            { field: 'itemName', header: 'Item', type: Types.select },
            { field: 'productName', header: 'Product', type: Types.select },
            { field: 'agentCode', header: 'Agent Code', type: Types.number, fixVal: 0 },
            { field: 'agencyName', header: 'Agency Name', type: Types.select },
            { field: 'activationDate', header: 'Activation Date', type: Types.date, dateFormat: 'dd-MM-yyyy' },
            { field: 'expiryDate', header: 'Expiry Date', type: Types.dateTime, dateFormat: 'dd-MM-yyyy' }
        ];

        this.cols.unshift(...this.selectedColumns);
        this.exportCol = cloneDeep(this.cols);
    }

    ngOnInit(): void {
        this.agentList = this._filterService.agentListByValue;

        // common filter
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            // this.sortColumn = resp['sortColumn'];
            this.selectedAgent = resp['table_config']['agencyName']?.value;
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }

            // this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['activationDate'].value) {
                resp['table_config']['activationDate'].value = new Date(resp['table_config']['activationDate'].value);
            }
            if (resp['table_config']['expiryDate'].value) {
                resp['table_config']['expiryDate'].value = new Date(resp['table_config']['expiryDate'].value);
            }
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShowCompleted = true;
            this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns);
            this.isFilterShowCompletedChange.emit(this.isFilterShowCompleted);
            this.primengTable._filter();
        });
    }

    ngAfterViewInit() {
        // Defult Active filter show
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShowCompleted = true;
            this.isFilterShowCompletedChange.emit(this.isFilterShowCompleted);
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
            if (filterData['table_config']['activationDate'].value) {
                filterData['table_config']['activationDate'].value = new Date(filterData['table_config']['activationDate'].value);
            }
            if (filterData['table_config']['expiryDate'].value) {
                filterData['table_config']['expiryDate'].value = new Date(filterData['table_config']['expiryDate'].value);
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

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControlCompleted.value)
            return `no search results found for \'${this.searchInputControlCompleted.value}\'.`;
        else return 'No data to display';
    }

    refreshItems(event?: any) {
        this.isLoading = true;
        const filterReq = this.getNewFilterReq(event);
        filterReq['Filter'] = this.searchInputControlCompleted.value;

        this.crmService.getDeliveredProductList(filterReq).subscribe({
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
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`;
                this.agentList[i].id_by_value = this.agentList[i].agency_name;
            }
        })
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
                    data: { record: record, wlSettingList: this.getWLSettingList, from: 'completed' },
                    panelClass: ['custom-dialog-modal-md'],
                    autoFocus: false,
                }).afterClosed().subscribe((res: any) => {
                    if (res && res == 'completed') {
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
        window.open("//" + record?.link_url, '_blank');
    }

    viewDetail(record): void {
        this.matDialog.open(TechInfoTabsComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    blockAction(record, index): void {
        // if (!Security.hasPermission(agentsPermissions.removeAllSubagentPermissions)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }

        const label: string = 'Blocked';
        this.conformationService
            .open({
                title: label,
                message: 'Do you want to Blocked?',
                inputBox: 'Status Remark',
                customShow: true,
                dateCustomShow: false
            })
            .afterClosed()
            .subscribe((res) => {
                if (res?.action === 'confirmed') {
                    let newJson = {
                        ServiceId: record.id,
                        Isblock: true,
                        BlockRemarks: res?.statusRemark ? res?.statusRemark : ""
                    }
                    this.crmService.blocked(newJson).subscribe({
                        next: (res) => {
                            if (res) {
                                this.alertService.showToast(
                                    'success',
                                    'Blocked Successfully!',
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
    }

    updateExpiryDate(record): void {
        if (!Security.hasPermission(techDashPermissions.updateExpiryDatePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Update Expiry Date';
        this.conformationService
            .open({
                title: label,
                message: 'Do you want to Update Expiry Date?',
                inputBox: 'Date',
                dateCustomShow: true,
                customShow: false,
                datepickerParameter: record?.expiryDate
            })
            .afterClosed()
            .subscribe((res) => {
                if (res?.action === 'confirmed') {
                    let newJson = {
                        Id: record?.id ? record?.id : "",
                        NewExpiryDate: res?.date ? DateTime.fromISO(res?.date).toFormat('yyyy-MM-dd') : ""
                    }
                    this.crmService.updateExpiryDate(newJson).subscribe({
                        next: (res) => {
                            this.alertService.showToast(
                                'success',
                                'Update Expiry Date has been updated!',
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

    exportExcel(event?: any): void {
        if (!Security.hasExportDataPermission(this.module_name)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        const filterReq = this.getNewFilterReq(event);
        filterReq['Filter'] = this.searchInputControlCompleted.value;
        filterReq['Take'] = this.totalRecords;

        this.crmService.getDeliveredProductList(filterReq).subscribe(data => {
            for (var dt of data.data) {
                dt.activationDate = dt.activationDate ? DateTime.fromISO(dt.activationDate).toFormat('dd-MM-yyyy') : ''
                dt.expiryDate = dt.expiryDate ? DateTime.fromISO(dt.expiryDate).toFormat('dd-MM-yyyy') : ''
            }
            Excel.export(
                'Delivered',
                [
                    { header: 'Item Code', property: 'itemCode' },
                    { header: 'Item', property: 'itemName' },
                    { header: 'Product', property: 'productName' },
                    { header: 'Agent Code', property: 'agentCode' },
                    { header: 'Agency Name', property: 'agencyName' },
                    { header: 'Activation Date', property: 'activationDate' },
                    { header: 'Expiry Date', property: 'expiryDate' },
                ],
                data.data, "Delivered", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }]);
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

    // techDate(record): void {
    //     // const label: string = 'Delete City';
    //     // this.conformationService
    //     //     .open({
    //     //         title: label,
    //     //         message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.display_name + ' ?',
    //     //     })
    //     //     .afterClosed()
    //     //     .subscribe((res) => {
    //     //         if (res === 'confirmed') {
    //     //             this.cityService.delete(record.id).subscribe({
    //     //                 next: () => {
    //     //                     this.alertService.showToast(
    //     //                         'success',
    //     //                         'City has been deleted!',
    //     //                         'top-right',
    //     //                         true
    //     //                     );
    //     //                     this.refreshItems();
    //     //                 },
    //     //                 error: (err) => {
    //     //                     this.alertService.showToast(
    //     //                         'error',
    //     //                         err,
    //     //                         'top-right',
    //     //                         true
    //     //                     );
    //     //                 },

    //     //             });
    //     //         }
    //     //     });
    // }
}
