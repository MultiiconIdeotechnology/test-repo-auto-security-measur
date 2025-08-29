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
import { BaseListingComponent } from 'app/form-models/base-listing';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { DateTime } from 'luxon';
import { AgentService } from 'app/services/agent.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { GlobalSearchService } from 'app/services/global-search.service';
import { Excel } from 'app/utils/export/excel';
import { DomainSslVerificationComponent } from '../domain-ssl-verification/domain-ssl-verification.component';

@Component({
    selector: 'app-crm-tech-dashboard-blocked',
    templateUrl: './blocked.component.html',
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
export class TechDashboardBlockedComponent extends BaseListingComponent {
    @Input() isFilterShowBlocked: boolean;
    @Output() isFilterShowBlockedChange = new EventEmitter<boolean>();
    @ViewChild('tabGroup') tabGroup;
    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sortArchive: MatSort;

    module_name = module_name.lead;
    filter_table_name = filter_module_name.tech_dashboard_blocked;
    private settingsUpdatedSubscription: Subscription;
    cols = [];
    total = 0;
    dataList: any;
    appConfig = AppConfig;
    isLoading: any;
    searchInputControlBlocked = new FormControl('');
    getWLSettingList = [];
    Mainmodule: any;
    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;
    data: any;
    selectedAgent: any;
    agentList: any[] = [];
    filter: any = {}

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
        this.sortColumn = 'blockDate';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit(): void {
        this.agentList = this._filterService.agentListByValue;

        // common filter
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.selectedAgent = resp['table_config']['agency_name']?.value;
            if (this.selectedAgent && this.selectedAgent.id) {
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
            }
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['blockDate'].value) {
                resp['table_config']['blockDate'].value = new Date(resp['table_config']['blockDate'].value);
            }
            if (resp['table_config']['expiry_date'].value) {
                resp['table_config']['expiry_date'].value = new Date(resp['table_config']['expiry_date'].value);
            }
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShowBlocked = true;
            this.isFilterShowBlockedChange.emit(this.isFilterShowBlocked);
            this.primengTable._filter();
        });
    }

    ngAfterViewInit() {
        // Defult Active filter show
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShowBlocked = true;
            this.isFilterShowBlockedChange.emit(this.isFilterShowBlocked);
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            setTimeout(() => {
                this.selectedAgent = filterData['table_config']['agency_name']?.value;
                if (this.selectedAgent && this.selectedAgent.id) {
                    const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                    if (!match) {
                        this.agentList.push(this.selectedAgent);
                    }
                }
            }, 1000);

            if (filterData['table_config']['blockDate'].value) {
                filterData['table_config']['blockDate'].value = new Date(filterData['table_config']['blockDate'].value);
            }
            if (filterData['table_config']['expiry_date'].value) {
                filterData['table_config']['expiry_date'].value = new Date(filterData['table_config']['expiry_date'].value);
            }
            this.primengTable['filters'] = filterData['table_config'];
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
        }
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
                datepickerParameter: record?.activation_date
            })
            .afterClosed()
            .subscribe((res) => {
                if (res?.action === 'confirmed') {
                    let newJson = {
                        id: record?.subid ? record?.subid : "",
                        expiry_date: res?.date ? DateTime.fromISO(res?.date).toFormat('yyyy-MM-dd') : ""
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

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControlBlocked.value)
            return `no search results found for \'${this.searchInputControlBlocked.value}\'.`;
        else return 'No data to display';
    }

    refreshItems(event?: any) {
        this.isLoading = true;
        const filterReq = this.getNewFilterReq(event);
        filterReq['Filter'] = this.searchInputControlBlocked.value;
        this.crmService.getTechBlockedProductList(filterReq).subscribe({
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

    wlSetting(record:any){
        if (!Security.hasPermission(techDashPermissions.wlSettingPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.crmService.getWLSettingListTwoParams(record?.code, record?.item_name).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.getWLSettingList = data[0];

                this.matDialog.open(DomainSslVerificationComponent, {
                    disableClose: true,
                    data: {record:record, wlSettingList:this.getWLSettingList, from:'blocked'},
                    panelClass: ['custom-dialog-modal-md'],
                    autoFocus: false,
                  }).afterClosed().subscribe((res:any) => {
                    if(res && res == 'blocked'){
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

    unBlocked(record, index): void {
        // if (!Security.hasPermission(agentsPermissions.removeAllSubagentPermissions)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }

        const label: string = 'Un-Blocked';
        this.conformationService
            .open({
                title: label,
                message:
                    'Do you want to Un-Blocked?'
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    let newJson = {
                        id: record.subid,
                        is_block: false
                    }
                    this.crmService.unblocked(newJson).subscribe({
                        next: (res) => {
                            this.alertService.showToast(
                                'success',
                                'Un-blocked Successfully!',
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
    }

    ngOnDestroy(): void {
        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }

    exportExcel(event?: any): void {
        if (!Security.hasExportDataPermission(this.module_name)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const filterReq = this.getNewFilterReq(event);
        filterReq['Filter'] = this.searchInputControlBlocked.value;
        filterReq['Take'] = this.totalRecords;

        this.crmService.getTechBlockedProductList(filterReq).subscribe(data => {
            for (var dt of data.data) {
                dt.blockDate = dt.blockDate ? DateTime.fromISO(dt.blockDate).toFormat('dd-MM-yyyy') : ''
                dt.expiry_date = dt.expiry_date ? DateTime.fromISO(dt.expiry_date).toFormat('dd-MM-yyyy') : ''
            }
            Excel.export(
                'Blocked',
                [
                    { header: 'Item Code', property: 'itemCode' },
                    { header: 'Item.', property: 'itemName' },
                    { header: 'Product', property: 'productName' },
                    { header: 'Agent Code', property: 'agentCode' },
                    { header: 'Agency Name', property: 'agencyName' },
                    { header: 'Block Date', property: 'blockDate' },
                    { header: 'Expiry Date', property: 'expiryDate' },
                    { header: 'RM', property: 'rm' },
                ],
                data.data, "Blocked", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }]);
        });
    }
}
