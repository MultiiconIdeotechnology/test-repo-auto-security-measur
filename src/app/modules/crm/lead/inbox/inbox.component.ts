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
import { Security, filter_module_name, leadPermissions, messages, module_name } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject, takeUntil } from 'rxjs';
import { MarketingMaterialsComponent } from '../marketing-materials/marketing-materials.component';
import { DialCallListComponent } from '../dial-call-list/dial-call-list.component';
import { CRMScheduleCallListComponent } from '../schedule-call-list/schedule-call-list.component';
import { EntityService } from 'app/services/entity.service';
import { LeadStatusChangedLogComponent } from '../lead-status-changed-log/lead-status-changed-log.component';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'app-inbox',
    templateUrl: './inbox.component.html',
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
        PrimeNgImportsModule
    ]
})

export class InboxComponent extends BaseListingComponent {
    @Input() isFilterShowInbox: boolean;
    @ViewChild('tabGroup') tabGroup;
    @ViewChild(MatPaginator) public _paginatorInbox: MatPaginator;
    @ViewChild(MatSort) public _sortInbox: MatSort;

    Mainmodule: any;
    filter_table_name = filter_module_name.leads_inbox;
    private settingsUpdatedSubscription: Subscription;
    statusList = ['New', 'Live', 'Dead'];
    typeList = ['B2B Partner', 'Build My Brand', 'WL', 'Boost My Brand', 'Corporate'];

    cols = [];
    dataList = [];
    searchInputControlInbox = new FormControl('');
    deadLeadId: any;
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
        private entityService: EntityService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.lead);
        this.key = this.module_name;
        this.sortColumn = 'priority_id';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit(): void {
        // common filter
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['last_call_date_time'].value) {
                resp['table_config']['last_call_date_time'].value = new Date(resp['table_config']['last_call_date_time'].value);
            }
            if (resp['table_config']['entry_date_time'].value) {
                resp['table_config']['entry_date_time'].value = new Date(resp['table_config']['entry_date_time'].value);
            }
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShowInbox = true;
            this.primengTable._filter();
        });
    }

    ngAfterViewInit() {
        // Defult Active filter show
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShowInbox = true;
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            if (filterData['table_config']['last_call_date_time'].value) {
                filterData['table_config']['last_call_date_time'].value = new Date(filterData['table_config']['last_call_date_time'].value);
            }
            if (filterData['table_config']['entry_date_time'].value) {
                filterData['table_config']['entry_date_time'].value = new Date(filterData['table_config']['entry_date_time'].value);
            }
            this.primengTable['filters'] = filterData['table_config'];
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
        }
    }


    refreshItems(event?: any): void {
        this.isLoading = true;
        const filterReq = this.getNewFilterReq(event);
        filterReq['Filter'] = this.searchInputControlInbox.value;
        this.crmService.getInboxLeadList(filterReq).subscribe({
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

        // this.matDialog.open(CRMDialCallEntryComponent, {
        //     data: { data: record, readonly: true },
        //     disableClose: true,
        // });

        this.matDialog.open(DialCallListComponent, {
            data: { data: record, readonly: true },
            disableClose: true
        }).afterClosed().subscribe({
            next: (res) => {
                if (res) {
                    this.refreshItems();
                }
            }
        })
    }

    callHistory(record): void {
        if (!Security.hasPermission(leadPermissions.callHistoryPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        // this.matDialog.open(CallHistoryComponent, {
        //     data: { data: record, readonly: true },
        //     disableClose: true
        // });
        this.matDialog.open(DialCallListComponent, {
            data: { data: record, readonly: true, selectedTabIndex: 3 },
            disableClose: true,
        });
    }

    scheduleCall(record): void {
        if (!Security.hasPermission(leadPermissions.scheduleCallPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // this.matDialog.open(CRMScheduleCallEntryComponent, {
        //     data: { data: record, readonly: true },
        //     disableClose: true,
        // });

        this.matDialog.open(CRMScheduleCallListComponent, {
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
            message: 'Are you sure to ' + record?.agency_name + ' ?',
            inputBox: 'Status Remark',
            customShow: true
        }).afterClosed().subscribe({
            next: (res) => {
                if (res?.action === 'confirmed') {
                    const newJson = {
                        id: this.deadLeadId,
                        status_remark: res?.statusRemark ? res?.statusRemark : ""
                    }

                    this.crmService.deadLead(newJson).subscribe({
                        next: (res) => {
                            if (res) {
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

    editLead(record): void {
        // this.matDialog.open(CRMLeadEntryComponent, {
        //     data: { data: record, readonly: false, editFlag: true },
        //     disableClose: true
        // }).afterClosed().subscribe(res => {
        //     if (res) {
        //         this.refreshItems();
        //     }
        // })
        this.entityService.raiseleadEntityCall({ data: record, readonly: false, editFlag: true })
        this.entityService.onrefreshleadEntityCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                this.refreshItems();
            }
        })
    }

    statusChangedLog(record): void {
        // if (!Security.hasPermission(agentsPermissions.statusChangedLogsPermissions)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }

        this.matDialog.open(LeadStatusChangedLogComponent, {
            data: record,
            disableClose: true
        });
    }

    ngOnDestroy(): void {

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }

}
