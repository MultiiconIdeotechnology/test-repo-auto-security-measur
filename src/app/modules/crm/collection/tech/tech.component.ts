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
import { AppConfig } from 'app/config/app-config';
import { Security, messages, module_name, partnerPurchaseProductPermissions, techCollectionPermissions } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';
import { PurchaseProductComponent } from '../../agent/purchase-product/purchase-product.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DialTechCallListComponent } from '../tech-dial-call-list/tech-dial-call-list.component';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { EntityService } from 'app/services/entity.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentService } from 'app/services/agent.service';

@Component({
    selector: 'app-tech',
    templateUrl: './tech.component.html',
    // styles: [
    //     `
    //         .tbl-grid {
    //             grid-template-columns: 40px 60px 100px 245px 120px 190px 100px 150px 150px;
    //         }
    //     `,
    // ],
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
export class TechCollectionComponent extends BaseListingComponent{
    @Input() isFilterShowTech: boolean;
    @Input() dropdownListObj:{};

    agentList:any[] = [];
    selectedAgent:string;

    columns = [
        {
            key: 'calls',
            name: 'Calls',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false
        },
        {
            key: 'acCode',
            name: 'A/C Code',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
        },
        {
            key: 'agencyName',
            name: 'Name',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: true,
            tooltip: true,
        },
        {
            key: 'mobile',
            name: 'Mobile',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
        },
        {
            key: 'product',
            name: 'Product',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
        },
        {
            key: 'amount',
            name: 'Amount',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
        },
        {
            key: 'installmentDate',
            name: 'Installment Date',
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
            key: 'lastCallDate',
            name: 'Last call date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false
        }
    ];
    cols = [];
    dataList = [];
    searchInputControlTech = new FormControl('');

    @ViewChild('tabGroup') tabGroup;

    @ViewChild(MatPaginator) public _paginatorTech: MatPaginator;
    @ViewChild(MatSort) public _sortInbox: MatSort;

    Mainmodule: any;
    isLoading = false;
    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;

    module_name = module_name.crmagent
    total = 0;
    appConfig = AppConfig;
    data: any
    filter: any = {}
    formattedDate: string = '';

    constructor(
        private crmService: CrmService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        private entityService: EntityService,
        private agentService: AgentService
    ) {
        super(module_name.techDashboard)
        this.cols = this.columns.map(x => x.key);
        this.key = this.module_name;
        this.sortColumn = 'installmentDate';
        this.sortDirection = 'desc';
        this.Mainmodule = this
    }

    ngOnInit(): void {
        // this.searchInputControlTech.valueChanges
        //     .subscribe(() => {
        //         GridUtils.resetPaginator(this._paginatorTech);
        //         this.refreshItems();
        //     });
        // this.refreshItems();

        this.searchInputControlTech.valueChanges.subscribe(() => {
        //   this.refreshItems();
        });

    }

    ngOnChanges(){
        this.agentList = this.dropdownListObj['agentList'];
    }


    refreshItems(event?: any): void {
        this.isLoading = true;
        const filterReq = this.getNewFilterReq(event);
        filterReq['Filter'] = this.searchInputControlTech.value;

        // filterReq['Filter'] = this.searchInputControlTech.value;
        // filterReq['Skip'] = 0;
        // filterReq['Take'] = this._paginator.length;
        // filterReq['Take'] = this.totalRecords;

        // filterReq['OrderBy'] = 'installmentDate';
        // filterReq['OrderDirection'] = 1;

        // this.isLoading = true;
        // const filterReq = GridUtils.GetFilterReq(
        //     this._paginatorTech,
        //     this._sortInbox,
        //     this.searchInputControlTech.value
        // );
        this.crmService.getTechCollectionList(filterReq).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                // this._paginatorTech.length = data.total;
                this.totalRecords = data.total;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });

    }

    getAgent(value: string) {
        this.agentService.getAgentCombo(value).subscribe((data) => {
            this.agentList = data;

            for(let i in this.agentList){
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`
            }
        })
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControlTech.value)
            return `no search results found for \'${this.searchInputControlTech.value}\'.`;
        else return 'No data to display';
    }

    getStatusColor(status: string): string {
        if (status == 'New') {
            return 'text-green-600';
        } else if (status == 'Active') {
            return 'text-blue-600';
        } else if (status == 'InActive') {
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
        if (!Security.hasPermission(techCollectionPermissions.dailCallPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // this.matDialog.open(TechDialCallEntryComponent, {
        //     data: { data: record, readonly: true },
        //     disableClose: true,
        // }).afterClosed().subscribe(res => {
        //     if (res) {
        //         this.refreshItems();
        //     }
        // })

        this.matDialog.open(DialTechCallListComponent, {
            data: { data: record, readonly: true},
            disableClose: true
        }).afterClosed().subscribe({
            next: (res) => {
                this.refreshItems();
            }
        })
    }

    callHistory(record): void {
        if (!Security.hasPermission(techCollectionPermissions.callHistoryPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        // this.matDialog.open(TechCallHistoryComponent, {
        //     data: { data: record, readonly: true },
        //     disableClose: true
        // });

        this.matDialog.open(DialTechCallListComponent, {
            data: { data: record, readonly: true, selectedTabIndex: 3},
            disableClose: true
        }).afterClosed().subscribe({
            next: (res) => {
                this.refreshItems();
            }
        })
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
    }

    sendReminderEmail(record): void {
        // if (!Security.hasPermission(agentPermissions.marketingMaterialPermissions)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }
        // this.matDialog.open(MarketingMaterialsComponent, {
        //     data: { data: record, readonly: true },
        //     disableClose: true
        // });
        const label: string = 'Send Reminders WA/Email';
        this.conformationService
            .open({
                title: label,
                message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.agencyName + ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    const payload = {
                        agent_id: record?.agentid
                    }
                    this.crmService.getTechSendReminderWAEmail(payload).subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'success',
                                'Send Reminders WA/Email is successfully!',
                                'top-right',
                                true
                            );
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


    timeline(record): void {
        // if (!Security.hasPermission(agentPermissions.marketingMaterialPermissions)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }
        // this.matDialog.open(MarketingMaterialsComponent, {
        //     data: { data: record, readonly: true },
        //     disableClose: true
        // });
    }
}
