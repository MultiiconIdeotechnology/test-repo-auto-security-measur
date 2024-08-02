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
import { Security, messages, module_name, partnerPurchaseProductPermissions, travelCollectionPermissions } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';
import { TravelDialCallEntryComponent } from '../travel-dial-call-entry/travel-dial-call-entry.component';
import { TravelCallHistoryComponent } from '../travel-call-history/travel-call-history.component';
import { PurchaseProductComponent } from '../../agent/purchase-product/purchase-product.component';
import { DialTravelCallListComponent } from '../travel-dial-call-list/travel-dial-call-list.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentService } from 'app/services/agent.service';

@Component({
    selector: 'app-travel',
    templateUrl: './travel.component.html',
    styles: [
        `
            .tbl-grid {
                grid-template-columns: 40px 60px 100px 250px 110px 110px 150px 90px 115px 115px;
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
        PrimeNgImportsModule
    ]
})
export class TravelCollectionComponent extends BaseListingComponent{
    @Input() isFilterShowTravel: boolean;
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
            tooltip: false,
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
            key: 'creditLimit',
            name: 'Credit Limit',
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
            key: 'policy',
            name: 'Policy / Term',
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
            key: 'dueDate',
            name: 'Due Date',
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
            key: 'expiryDate',
            name: 'Expiry Login',
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
    searchInputControlTravel = new FormControl('');
    @ViewChild('tabGroup') tabGroup;

    @ViewChild(MatPaginator) public _paginatorTravel: MatPaginator;
    @ViewChild(MatSort) public _sortTravel: MatSort;

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
        private matDialog: MatDialog,
        private conformationService: FuseConfirmationService,
        private agentService: AgentService
    ) {
        super(module_name.techDashboard)
        this.cols = this.columns.map(x => x.key);
        this.key = this.module_name;
        this.sortColumn = 'dueDate';
        this.sortDirection = 'desc';
        this.Mainmodule = this
    }

    ngOnInit(): void {
        // this.searchInputControlTravel.valueChanges
        //     .subscribe(() => {
        //         GridUtils.resetPaginator(this._paginatorTravel);
        //         this.refreshItems();
        //     });
        // this.refreshItems();

        this.searchInputControlTravel.valueChanges.subscribe(() => {
            // this.refreshItems();
          });

    }

    ngOnChanges(){
        this.agentList = this.dropdownListObj['agentList'];
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        // const filterReq = GridUtils.GetFilterReq(
        //     this._paginatorTravel,
        //     this._sortTravel,
        //     this.searchInputControlTravel.value
        // );
        const filterReq = this.getNewFilterReq(event);
        filterReq['Filter'] = this.searchInputControlTravel.value;
        this.crmService.getTravelCollectionList(filterReq).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                // this._paginatorTravel.length = data.total;
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
        else if (this.searchInputControlTravel.value)
            return `no search results found for \'${this.searchInputControlTravel.value}\'.`;
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


    dialCall(record): void {
        if (!Security.hasPermission(travelCollectionPermissions.dailCallPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // this.matDialog.open(TravelDialCallEntryComponent, {
        //     data: { data: record, readonly: true },
        //     disableClose: true,
        // }).afterClosed().subscribe(res => {
        //     if (res) {
        //         this.refreshItems();
        //     }
        // })

        this.matDialog.open(DialTravelCallListComponent, {
            data: { data: record, readonly: true},
            disableClose: true
        }).afterClosed().subscribe({
            next: (res) => {
                this.refreshItems();
            }
        })
    }

    callHistory(record): void {
        if (!Security.hasPermission(travelCollectionPermissions.callHistoryPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        // this.matDialog.open(TravelCallHistoryComponent, {
        //     data: { data: record, readonly: true },
        //     disableClose: true
        // });

        this.matDialog.open(DialTravelCallListComponent, {
            data: { data: record, readonly: true, selectedTabIndex: 3},
            disableClose: true
        }).afterClosed().subscribe({
            next: (res) => {
                this.refreshItems();
            }
        })
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
                message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.name + ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    const payload = {
                        agent_id : record?.agentid
                    }
                    this.crmService.getTravelSendReminderWAEmail(payload).subscribe({
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
