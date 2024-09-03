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
import { BaseListingComponent } from 'app/form-models/base-listing';
import { DateTime } from 'luxon';
import { AgentService } from 'app/services/agent.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { GlobalSearchService } from 'app/services/global-search.service';

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
    @Input() dropdownFirstCallObj: any;
    @ViewChild('tabGroup') tabGroup;
    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sortArchive: MatSort;

    Mainmodule: any;
    module_name = module_name.techDashboard;
    filter_table_name = filter_module_name.tech_dashboard_completed;
    private settingsUpdatedSubscription: Subscription;
    cols = [];
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
        this.sortColumn = 'activation_date_sub';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit(): void {
        // common filter
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            // this.sortColumn = resp['sortColumn'];
                this.selectedAgent = resp['table_config']['agency_name']?.value;
                if (this.selectedAgent && this.selectedAgent.id) {
    
                    const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                    if (!match) {
                        this.agentList.push(this.selectedAgent);
                    }
                }
            this.selectedAgent = resp['table_config']['agency_name'].value;
            // this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['activation_date_sub'].value) {
                resp['table_config']['activation_date_sub'].value = new Date(resp['table_config']['activation_date_sub'].value);
            }
            if (resp['table_config']['expiry_date_sub'].value) {
                resp['table_config']['expiry_date_sub'].value = new Date(resp['table_config']['expiry_date_sub'].value);
            }
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShowCompleted = true;
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
                this.selectedAgent = filterData['table_config']['agency_name']?.value;
                if (this.selectedAgent && this.selectedAgent.id) {
    
                    const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                    if (!match) {
                        this.agentList.push(this.selectedAgent);
                    }
                }
            }, 1000);
            if (filterData['table_config']['activation_date_sub'].value) {
                filterData['table_config']['activation_date_sub'].value = new Date(filterData['table_config']['activation_date_sub'].value);
            }
            if (filterData['table_config']['expiry_date_sub'].value) {
                filterData['table_config']['expiry_date_sub'].value = new Date(filterData['table_config']['expiry_date_sub'].value);
            }
            this.primengTable['filters'] = filterData['table_config'];
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
        }
    }

    ngOnChanges() {
        this.agentList = this.dropdownFirstCallObj['agentList'];
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

        this.crmService.getTechCompletedProductList(filterReq).subscribe({
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
                        id: record.id,
                        is_block: true,
                        special_status_remark: res?.statusRemark ? res?.statusRemark : ""
                    }
                    this.crmService.blocked(newJson).subscribe({
                        next: (res) => {
                            this.alertService.showToast(
                                'success',
                                'Blocked Successfully!',
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
                datepickerParameter: record?.expiry_date_sub
            })
            .afterClosed()
            .subscribe((res) => {
                if (res?.action === 'confirmed') {
                    let newJson = {
                        id: record?.id ? record?.id : "",
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

    ngOnDestroy(): void {

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
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
