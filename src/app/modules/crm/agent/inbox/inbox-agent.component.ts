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
import { Router, RouterOutlet } from '@angular/router';
import { AppConfig } from 'app/config/app-config';
import { Security, agentPermissions, filter_module_name, messages, module_name } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';
import { MarketingMaterialsComponent } from '../marketing-materials/marketing-materials.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Routes } from 'app/common/const';
import { DialAgentCallListComponent } from '../dial-call-list/dial-call-list.component';
import { Linq } from 'app/utils/linq';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentService } from 'app/services/agent.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'inbox-agent',
    templateUrl: './inbox-agent.component.html',
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
export class InboxAgentComponent extends BaseListingComponent {
    @Input() isFilterShowInbox: boolean
    @Input() dropdownListObj: {};
    @ViewChild('tabGroup') tabGroup;
    @ViewChild(MatPaginator) public _paginatorInbox: MatPaginator;
    @ViewChild(MatSort) public _sortInbox: MatSort;

    module_name = module_name.crmagent;
    filter_table_name = filter_module_name.agents_inbox;
    private settingsUpdatedSubscription: Subscription;
    cols = [];
    dataList = [];
    searchInputControlInbox = new FormControl('');
    statusList = ['New', 'Active', 'Inactive', 'Dormant'];
    Mainmodule: any;
    isLoading = false;
    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;

    total = 0;
    appConfig = AppConfig;
    data: any
    filter: any = {}
    formattedDate: string = '';
    agentList: any[] = [];
    selectedAgent!: string

    constructor(
        private crmService: CrmService,
        private matDialog: MatDialog,
        private agentService: AgentService,
        private conformationService: FuseConfirmationService,
        private router: Router,
        public _filterService: CommonFilterService

    ) {
        super(module_name.crmagent);
        this.key = this.module_name;
        this.sortColumn = 'priorityid';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit(): void {
        // common filter
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.sortColumn = resp['sortColumn'];
            this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['createdDate'].value) {
                resp['table_config']['createdDate'].value = new Date(resp['table_config']['createdDate'].value);
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
            if (filterData['table_config']['createdDate'].value) {
                filterData['table_config']['createdDate'].value = new Date(filterData['table_config']['createdDate'].value);
            }
            this.primengTable['filters'] = filterData['table_config'];
        }
    }

    ngOnChanges() {
        this.agentList = this.dropdownListObj['agentList'];
    }

    // Api function to get the agent List
    getAgent(value: string) {
        this.agentService.getAgentCombo(value).subscribe((data) => {
            this.agentList = data;

            for (let i in this.agentList) {
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`
            }
        })
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        const filterReq = this.getNewFilterReq(event);
        filterReq['Filter'] = this.searchInputControlInbox.value;
        this.crmService.getInboxAgentList(filterReq).subscribe({
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
        } else if (status == 'Inactive') {
            return 'text-red-600';
        } else if (status == 'Dormant') {
            return 'text-red-600';
        }
        else {
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

        // this.matDialog.open(CRMDialCallEntryComponent, {
        //     data: { data: record, readonly: true, agentDialCallFlag: true },
        //     disableClose: true,
        // });

        this.matDialog.open(DialAgentCallListComponent, {
            data: { data: record, readonly: true, agentDialCallFlag: true },
            disableClose: true,
        }).afterClosed().subscribe({
            next: (res) => {
                if (res) {
                    this.refreshItems();
                }
            }
        })
    }

    callHistory(record): void {
        if (!Security.hasPermission(agentPermissions.callHistoryPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        // this.matDialog.open(CallHistoryComponent, {
        //     data: { data: record, readonly: true },
        //     disableClose: true
        // });
        this.matDialog.open(DialAgentCallListComponent, {
            data: { data: record, readonly: true, selectedTabIndex: 3 },
            disableClose: true,
        });
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
        // if (!Security.hasPermission(agentPermissions.timelinePermissions)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }

        // this.matDialog.open(CRMAgentTimelineComponent, {
        //     data: { data: record, readonly: true },
        //     disableClose: true,
        // });

        // this.router.navigate([Routes.customers.agent_entry_route + '/' + record.agentid + '/readonly'])
        Linq.recirect([Routes.customers.agent_entry_route + '/' + record.agentid + '/readonly']);
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

    ngOnDestroy(): void {

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }

    // reActive(record): void {
    //     const label: string = 'Reactive';
    //     this.conformationService
    //         .open({
    //             title: label,
    //             message: 'Do you want to Reactive?',
    //             inputBox: 'Reason',
    //             customShow: true
    //         })
    //         .afterClosed()
    //         .subscribe((res) => {
    //             if (res?.action === 'confirmed') {
    //                 let newJson = {
    //                     Id: record.agentid,
    //                     status_remark: res?.statusRemark ? res?.statusRemark : ""
    //                 }
    //                 this.crmService.reactive(newJson).subscribe({
    //                     next: (res) => {
    //                         this.refreshItems();
    //                         this.alertService.showToast(
    //                             'success',
    //                             'Reactive Successfully!',
    //                             'top-right',
    //                             true
    //                         );
    //                     },
    //                     error: (err) => {
    //                         this.alertService.showToast(
    //                             'error',
    //                             err,
    //                             'top-right',
    //                             true
    //                         );
    //                     },
    //                 });
    //             }
    //         });
    // }
}
