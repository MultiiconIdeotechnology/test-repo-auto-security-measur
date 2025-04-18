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
import { Router, RouterOutlet } from '@angular/router';
import { AppConfig } from 'app/config/app-config';
import { Security, agentPermissions, filter_module_name, messages, module_name } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Routes } from 'app/common/const';
import { Linq } from 'app/utils/linq';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentService } from 'app/services/agent.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { DialAgentCallListComponent } from '../../dial-call-list/dial-call-list.component';
import { ScheduleCallRemarkComponent } from '../../call-history/schedule-call-details/schedule-call-details.component';
import { MarketingMaterialsComponent } from '../../marketing-materials/marketing-materials.component';
import { UserService } from 'app/core/user/user.service';
import { EmployeeService } from 'app/services/employee.service';

@Component({
    selector: 'app-potential-lead',
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
    ],
    templateUrl: './potential-lead.component.html',
    styleUrls: ['./potential-lead.component.scss']
})
export class PotentialLeadComponent extends BaseListingComponent {
    @Input() isFilterShowPotential: boolean;
    @Output() isFilterShowPotentialChange = new EventEmitter<boolean>();
    @ViewChild('tabGroup') tabGroup;

    module_name = module_name.crmagent;
    filter_table_name = filter_module_name.agents_potential_lead;
    private settingsUpdatedSubscription: Subscription;
    cols = [];
    dataList = [];
    searchInputControlPotential = new FormControl('');
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
    selectedAgent!: any
    user:any = {};
    rmList:any = [];

    constructor(
        private crmService: CrmService,
        private matDialog: MatDialog,
        private agentService: AgentService,
        private conformationService: FuseConfirmationService,
        private router: Router,
        public _filterService: CommonFilterService,
        private userService: UserService,
        private employeeService: EmployeeService,

    ) {
        super(module_name.crmagent);
        this.key = this.module_name;
        this.sortColumn = 'priorityid';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);

         this.userService.user$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((user: any) => {
                    this.user = user;
                });
    }


    ngOnInit(): void {
        // this.agentList = this._filterService.agentListByValue;
        // this.rmList = this._filterService.rmListByValue;

        // common filter
        // this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
        //     this.selectedAgent = resp['table_config']['agencyName']?.value;
        //     if (this.selectedAgent && this.selectedAgent.id) {
        //         const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        //         if (!match) {
        //             this.agentList.push(this.selectedAgent);
        //         }
        //     }

        //     this.primengTable['filters'] = resp['table_config'];
        //     this.isFilterShowPotential = true;
        //     this.isFilterShowPotentialChange.emit(this.isFilterShowPotential);
        //     this.primengTable._filter();
        // });
    }

    ngAfterViewInit() {
        // Defult Active filter show
        // if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
        //     this.isFilterShowPotential = true;
        //     this.isFilterShowPotentialChange.emit(this.isFilterShowPotential);
        //     let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
        //     setTimeout(() => {
        //         this.selectedAgent = filterData['table_config']['agencyName']?.value;
        //         if (this.selectedAgent && this.selectedAgent.id) {

        //             const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        //             if (!match) {
        //                 this.agentList.push(this.selectedAgent);
        //             }
        //         }
        //     }, 1000);
        //     this.primengTable['filters'] = filterData['table_config'];
        //     // this.primengTable['_sortField'] = filterData['sortColumn'];
        //     // this.sortColumn = filterData['sortColumn'];
        // }
    }

    // Api function to get the agent List
    // getAgent(value: string, bool = true) {
    //     this.agentService.getAgentComboMaster(value, bool).subscribe((data) => {
    //         this.agentList = data;

    //         for (let i in this.agentList) {
    //             this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`;
    //             this.agentList[i].id_by_value = this.agentList[i].agency_name;
    //         }
    //     })
    // }

    refreshItems(event?: any): void {
        this.isLoading = true;
        if (this.searchInputControlPotential.value) { // Aa condtion tyarej add karivi jyare searchInput global variable na use karo hoy tyare
            event = {};
            event.first = event?.first || 0;
        }

        const filterReq = this.getNewFilterReq(event);
        filterReq['Filter'] = this.searchInputControlPotential.value;

        if (Security.hasPermission(agentPermissions.viewOnlyAssignedPermissions)) {
            filterReq["relationmanagerId"] = this.user.id
        }

        this.crmService.getPotentialLeadAgentList(filterReq).subscribe({
            next: (data) => {
                this.isLoading = false;
                let potentialLeadData = data?.dynamicList;
                this.getPotentialList(potentialLeadData)
                this.totalRecords = data?.total;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }

    getPotentialList(dataResponse: any) {
        this.dataList = [];
        for (let data of dataResponse) {
            if (data.value && Object.keys(data?.value)?.length) {
                for (let el of data?.value) {
                    this.dataList.unshift(el);
                }
            }
        }
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControlPotential.value)
            return `no search results found for \'${this.searchInputControlPotential.value}\'.`;
        else return 'No data to display';
    }

    getStatusColor(status: string): string {
        if (status == 'New') {
            return 'text-blue-500';
        } else if (status == 'Dormant') {
            return 'text-yellow-600';
        } else if (status == 'Active') {
            return 'text-green-600';
        } else if (status == 'Inactive') {
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

    dialCall(record: any): void {
        if (!Security.hasPermission(agentPermissions.dailCallPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

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

    // Schedule Call Dialog
    callSchedule(element: any) {
        let dataObj = JSON.parse(JSON.stringify(element));
        if (dataObj?.is_call_rescheduled) {
            dataObj.call_purpose = dataObj?.reschedule_call_purpose || '';
            this.matDialog.open(ScheduleCallRemarkComponent, {
                data: dataObj,
                disableClose: true
            }).afterClosed().subscribe(res => {
                if (!res) {
                    return
                }
            })
        }
    }

    callHistory(record: any): void {
        if (!Security.hasPermission(agentPermissions.callHistoryPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(DialAgentCallListComponent, {
            data: { data: record, readonly: true, selectedTabIndex: 3 },
            disableClose: true,
        }).afterClosed().subscribe({
            next: (res) => {
                if (res) {
                    this.refreshItems();
                }
            }
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

}
