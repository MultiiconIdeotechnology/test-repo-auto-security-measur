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
import { Security, agentPermissions, messages, module_name, partnerPurchaseProductPermissions } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';
import { PurchaseProductComponent } from '../purchase-product/purchase-product.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Routes } from 'app/common/const';
import { DialAgentCallListComponent } from '../dial-call-list/dial-call-list.component';
import { Linq } from 'app/utils/linq';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { AgentService } from 'app/services/agent.service';

@Component({
    selector: 'app-partners',
    templateUrl: './partners.component.html',
    styles: [
        `
        .tbl-grid {
            grid-template-columns: 40px 60px 90px 90px 300px 120px 120px 145px;
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
        MatProgressBarModule,
        PrimeNgImportsModule
    ]
})
export class PartnersComponent extends BaseListingComponent{
    @Input() isFilterShowPartners: boolean
    @Input() dropdownListObj:{};

    cols = [];
    total = 0;

    columns = [
        {
            key: 'callCount',
            name: 'Calls',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            callAction: true
        },
        {
            key: 'status',
            name: 'Status',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
            toColor: true
        },
        {
            key: 'acCode',
            name: 'AC Code',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        },
        {
            key: 'agencyName',
            name: 'Agency',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        },
        // {
        //     key: 'callPurpose',
        //     name: 'Purpose',
        //     is_date: false,
        //     date_formate: '',
        //     is_sortable: true,
        //     class: '',
        //     is_sticky: false,
        //     align: '',
        //     indicator: false,
        //     tooltip: true,
        // },
        {
            key: 'createdDate',
            name: 'Created Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false,
        },
        {
            key: 'latestDate',
            name: 'Last Login',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false,
            lastLogin: true
        },
        {
            key: 'lastTransaction',
            name: 'Last Transaction',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false,
        },
    ]
    dataList: any;
    appConfig = AppConfig;
    isLoading: any;
    searchInputControlpartners = new FormControl('');
    @ViewChild('tabGroup') tabGroup;
    @ViewChild(MatPaginator) public _paginatorArchive: MatPaginator;
    @ViewChild(MatSort) public _sortArchive: MatSort;
    statusList = [ 'New', 'Active', 'Inactive', 'Dormant'];

    Mainmodule: any;
    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;
    agentList: any[] = [];
    selectedAgent!: string;
    module_name = module_name.crmagent
    data: any
    filter: any = {}

    ngOnInit(): void {
        // this.searchInputControlpartners.valueChanges
        //     .subscribe(() => {
        //         GridUtils.resetPaginator(this._paginatorArchive);
        //         this.refreshItems();
        //     });
        // this.refreshItems();

        this.searchInputControlpartners.valueChanges
        .subscribe(() => {
          // GridUtils.resetPaginator(this._paginatorPending);
        //   this.refreshItems();
        });
       
    }

    ngOnChanges(){
        this.agentList = this.dropdownListObj['agentList'];
    }

    getAgent(value: string) {
        this.agentService.getAgentCombo(value).subscribe((data) => {
            this.agentList = data;

            for(let i in this.agentList){
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`
            }
        })
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
        } else {
            return '';
        }
    }

    constructor(
        private crmService: CrmService,
        private matDialog: MatDialog,
        private agentService: AgentService,
        private conformationService: FuseConfirmationService,
    ) {
        super(module_name.crmagent);
        this.cols = this.columns.map(x => x.key);
        this.key = this.module_name;
        this.sortColumn = 'createdDate';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
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
        const filterReq = this.getNewFilterReq(event);
        filterReq['Filter'] = this.searchInputControlpartners.value;
        // const filterReq = GridUtils.GetFilterReq(
        //     this._paginatorArchive,
        //     this._sortArchive,
        //     this.searchInputControlpartners.value
        // );
        this.crmService.getPartnerAgentList(filterReq).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                this.totalRecords = data.total;
                // this._paginatorArchive.length = data.total;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }

    getLastLogin(item: any): any {
        const iosLogin = item?.iosLastLogin ? new Date(item?.iosLastLogin) : null;
        const androidLogin = item?.androidLastLogin ? new Date(item?.androidLastLogin) : null;
        const webLogin = item?.webLastLogin ? new Date(item?.webLastLogin) : null;

        // Check all dates are null
        // if (!iosLogin && !androidLogin && !webLogin) {
        //     return '-';
        // }
        const latestLogin = this.findLatestDate([iosLogin, androidLogin, webLogin]);
        return latestLogin;
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
        });
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
}
