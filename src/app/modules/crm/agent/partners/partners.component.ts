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
import { Security, agentPermissions, filter_module_name, messages, module_name, partnerPurchaseProductPermissions } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BehaviorSubject, Subject } from 'rxjs';
import { PurchaseProductComponent } from '../purchase-product/purchase-product.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Routes } from 'app/common/const';
import { DialAgentCallListComponent } from '../dial-call-list/dial-call-list.component';
import { Linq } from 'app/utils/linq';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { AgentService } from 'app/services/agent.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'app-partners',
    templateUrl: './partners.component.html',
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
        MatProgressBarModule,
        PrimeNgImportsModule
    ]
})
export class PartnersComponent extends BaseListingComponent {
    @Input() isFilterShowPartners: boolean;
    @Output() isFilterShowPartnersChange = new EventEmitter<boolean>();
    @ViewChild('tabGroup') tabGroup;
    @ViewChild(MatPaginator) public _paginatorArchive: MatPaginator;
    @ViewChild(MatSort) public _sortArchive: MatSort;

    private selectedOptionTwoSubjectThree = new BehaviorSubject<any>('');
    selectionDateDropdownThree$ = this.selectedOptionTwoSubjectThree.asObservable();

    private selectedOptionTwoSubjectFour = new BehaviorSubject<any>('');
    selectionDateDropdownFour$ = this.selectedOptionTwoSubjectFour.asObservable();

    private selectedOptionTwoSubjectFive = new BehaviorSubject<any>('');
    selectionDateDropdownFive$ = this.selectedOptionTwoSubjectFive.asObservable();

    updateSelectedOptionThree(option: string): void {
        this.selectedOptionTwoSubjectThree.next(option);
    }

    updateSelectedOptionFour(option: string): void {
        this.selectedOptionTwoSubjectFour.next(option);
    }

    updateSelectedOptionFive(option: string): void {
        this.selectedOptionTwoSubjectFive.next(option);
    }

    Mainmodule: any;
    module_name = module_name.crmagent;
    filter_table_name = filter_module_name.agents_partners;
    private settingsUpdatedSubscription: Subscription;
    cols = [];
    total = 0;
    dataList: any;
    appConfig = AppConfig;
    isLoading: any;
    searchInputControlpartners = new FormControl('');
    statusList = ['New', 'Active', 'Inactive', 'Dormant'];

    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;
    agentList: any[] = [];
    selectedAgent: any = {};
    data: any
    filter: any = {}

    constructor(
        private crmService: CrmService,
        private matDialog: MatDialog,
        private agentService: AgentService,
        private conformationService: FuseConfirmationService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.crmagent);
        this.key = this.module_name;
        this.sortColumn = 'createdDate';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit(): void {
        this.agentList = this._filterService.agentListByValue;

        // common filter
        this._filterService.updateSelectedOption('');
        this._filterService.updatedSelectionOptionTwo('');
        this.updateSelectedOptionThree('');
        this.updateSelectedOptionFour('');
        this.updateSelectedOptionFive('');
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.selectedAgent = resp['table_config']['agencyName']?.value;
            const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
            if (!match) {
                this.agentList.push(this.selectedAgent);
            }
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['createdDate']?.value != null && resp['table_config']['createdDate'].value.length) {
                this._filterService.updateSelectedOption('custom_date_range');
                this._filterService.rangeDateConvert(resp['table_config']['createdDate']);
            }

            if (resp['table_config']['lastTransaction']?.value != null && resp['table_config']['lastTransaction'].value.length) {
                this._filterService.updatedSelectionOptionTwo('custom_date_range');
                this._filterService.rangeDateConvert(resp['table_config']['lastTransaction']);
            }

            if (resp['table_config']['first_login_date_time']?.value != null && resp['table_config']['first_login_date_time'].value.length) {
                this.updateSelectedOptionThree('custom_date_range');
                this._filterService.rangeDateConvert(resp['table_config']['first_login_date_time']);
            }

            if (resp['table_config']['first_transaction_date_time']?.value != null && resp['table_config']['first_transaction_date_time'].value.length) {
                this.updateSelectedOptionFour('custom_date_range');
                this._filterService.rangeDateConvert(resp['table_config']['first_transaction_date_time']);
            }

            if (resp['table_config']['lastLoginDateTime']?.value != null && resp['table_config']['lastLoginDateTime'].value.length) {
                this.updateSelectedOptionFive('custom_date_range');
                this._filterService.rangeDateConvert(resp['table_config']['lastLoginDateTime']);
            }
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShowPartners = true;
            this.isFilterShowPartnersChange.emit(this.isFilterShowPartners);
            this.primengTable._filter();
        });
    }

    ngAfterViewInit() {
        // Defult Active filter show
        this._filterService.updateSelectedOption('');
        this._filterService.updatedSelectionOptionTwo('');
        this.updateSelectedOptionThree('');
        this.updateSelectedOptionFour('');
        this.updateSelectedOptionFive('');
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShowPartners = true;
            this.isFilterShowPartnersChange.emit(this.isFilterShowPartners);
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
            if (filterData['table_config']['createdDate']?.value != null && filterData['table_config']['createdDate'].value.length) {
                this._filterService.updateSelectedOption('custom_date_range');
                this._filterService.rangeDateConvert(filterData['table_config']['createdDate']);
            }

            if (filterData['table_config']['lastTransaction']?.value != null && filterData['table_config']['lastTransaction'].value.length) {
                this._filterService.updatedSelectionOptionTwo('custom_date_range');
                this._filterService.rangeDateConvert(filterData['table_config']['lastTransaction']);
            }

            if (filterData['table_config']['lastTransaction']?.value != null && filterData['table_config']['lastTransaction'].value.length) {
                this._filterService.updatedSelectionOptionTwo('custom_date_range');
                this._filterService.rangeDateConvert(filterData['table_config']['lastTransaction']);
            }

            if (filterData['table_config']['call_date_time']?.value != null && filterData['table_config']['call_date_time'].value.length) {
                this._filterService.updatedSelectedContracting('custom_date_range');
                this._filterService.rangeDateConvert(filterData['table_config']['call_date_time']);
            }

            if (filterData['table_config']['first_login_date_time']?.value != null && filterData['table_config']['first_login_date_time'].value.length) {
                this.updateSelectedOptionThree('custom_date_range');
                this._filterService.rangeDateConvert(filterData['table_config']['first_login_date_time']);
            }
            this.primengTable['filters'] = filterData['table_config'];
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
        }
    }

    getAgent(value: string) {
        this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
            this.agentList = data;

            for (let i in this.agentList) {
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`;
                this.agentList[i].id_by_value = this.agentList[i].agency_name;
            }
        })
    }

    // getStatusColor(status: string): string {
    //     if (status == 'New') {
    //         return 'text-green-600';
    //     } else if (status == 'Active') {
    //         return 'text-blue-600';
    //     } else if (status == 'Inactive') {
    //         return 'text-red-600';
    //     } else if (status == 'Dormant') {
    //         return 'text-red-600';
    //     } else {
    //         return '';
    //     }
    // }
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

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControlpartners.value)
            return `no search results found for \'${this.searchInputControlpartners.value}\'.`;
        else return 'No data to display';
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

    refreshItems(event?: any) {
        this.isLoading = true;
        if (this.searchInputControlpartners.value) { // Aa condtion tyarej add karivi jyare searchInput global variable na use karo hoy tyare
            event = {};
            event.first = event?.first || 0;
        }
        const filterReq = this.getNewFilterReq(event);
        filterReq['Filter'] = this.searchInputControlpartners.value;
        this.crmService.getPartnerAgentList(filterReq).subscribe({
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

    // Get the last login date
    getLastLogin(item: any): string {
        const logins = [
            item.iosLastLogin ? new Date(item.iosLastLogin) : null,
            item.androidLastLogin ? new Date(item.androidLastLogin) : null,
            item.webLastLogin ? new Date(item.webLastLogin) : null
        ].filter(date => date !== null) as Date[];

        if (logins.length === 0) {
            return '';
        }

        const latestLogin = new Date(Math.max(...logins.map(date => date.getTime())));
        return latestLogin.toISOString();
    }


    dialCall(record): void {
        if (!Security.hasPermission(agentPermissions.dailCallPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // this.matDialog.open(CRMDialCallEntryComponent, {
        //     data: { data: record, readonly: true, agentDialCallFlag: true },
        //     disableClose: true,
        // });

        // this.matDialog.open(DialAgentCallListComponent, {
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
        }).afterClosed().subscribe({
            next: (res) => {
                if (res) {
                    this.refreshItems();
                }
            }
        });
    }

    purchaseProduct(record): void {
        if (!Security.hasPermission(partnerPurchaseProductPermissions.purchaseProductPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(PurchaseProductComponent, {
            width: '1000px',
            data: { data: record, readonly: true },
            disableClose: true,
        });

        // this.entityService.raiseleadEntityCall({})
        // this.entityService.onrefreshleadEntityCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
        //     next: (item) => {
        //     }
        // })
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
        if (!Security.hasPermission(partnerPurchaseProductPermissions.dormantsPermissions)) {
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

    reActive(record): void {
        const label: string = 'Reactive';
        this.conformationService
            .open({
                title: label,
                message: 'Do you want to Reactive?',
                inputBox: 'Reason',
                customShow: true
            })
            .afterClosed()
            .subscribe((res) => {
                if (res?.action === 'confirmed') {
                    let newJson = {
                        Id: record.agentid,
                        status_remark: res?.statusRemark ? res?.statusRemark : ""
                    }
                    this.crmService.reactive(newJson).subscribe({
                        next: (res) => {
                            this.refreshItems();
                            this.alertService.showToast(
                                'success',
                                'Reactive Successfully!',
                                'top-right',
                                true
                            );
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

    onOptionClickThree(option: any, primengTable: any, field: any, key?: any) {
        this.selectedOptionTwoSubjectThree.next(option.id_by_value);

        if (option.id_by_value && option.id_by_value != 'custom_date_range') {
            primengTable.filter(option, field, 'custom');
        } else if (option.id_by_value == 'custom_date_range') {
            primengTable.filter(null, field, 'custom');
        }
    }

    onOptionClickFour(option: any, primengTable: any, field: any, key?: any) {
        this.selectedOptionTwoSubjectFour.next(option.id_by_value);

        if (option.id_by_value && option.id_by_value != 'custom_date_range') {
            primengTable.filter(option, field, 'custom');
        } else if (option.id_by_value == 'custom_date_range') {
            primengTable.filter(null, field, 'custom');
        }
    }

    onOptionClickFive(option: any, primengTable: any, field: any, key?: any) {
        this.selectedOptionTwoSubjectFive.next(option.id_by_value);

        if (option.id_by_value && option.id_by_value != 'custom_date_range') {
            primengTable.filter(option, field, 'custom');
        } else if (option.id_by_value == 'custom_date_range') {
            primengTable.filter(null, field, 'custom');
        }
    }

    ngOnDestroy(): void {

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }
}
