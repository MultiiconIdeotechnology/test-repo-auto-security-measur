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
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { AppConfig } from 'app/config/app-config';
import { Security, filter_module_name, messages, module_name, partnerPurchaseProductPermissions, travelCollectionPermissions } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject, Subscription } from 'rxjs';
import { PurchaseProductComponent } from '../../agent/purchase-product/purchase-product.component';
import { DialTravelCallListComponent } from '../travel-dial-call-list/travel-dial-call-list.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentService } from 'app/services/agent.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'app-travel',
    templateUrl: './travel.component.html',
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
        MatTableModule,
        MatMenuModule,
        MatDialogModule,
        CommonModule,
        MatTabsModule,
        PrimeNgImportsModule
    ]
})
export class TravelCollectionComponent extends BaseListingComponent {
    filter_table_name = filter_module_name.collections_travel;
    @Input() isFilterShowTravel: boolean;
    @Input() dropdownListObj: {};
    @Input() activeTab: any;

    public settingsTravelSubscription: Subscription;
    agentList: any[] = [];
    selectedAgent: string;

    cols = [];
    dataList = [];
    searchInputControlTravel = new FormControl('');
    @ViewChild('tabGroup') tabGroup;

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
        private agentService: AgentService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.techDashboard)
        this.key = this.module_name;
        this.sortColumn = 'dueDate';
        this.sortDirection = 'desc';
        this.Mainmodule = this
    }

    ngOnInit(): void {

    }

    ngOnChanges() {
        if (this.activeTab == 'Travel') {
            this.settingsTravelSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
                this.sortColumn = resp['sortColumn'];
                this.primengTable['_sortField'] = resp['sortColumn'];

                if (resp['table_config']['dueDate'].value) {
                    resp['table_config']['dueDate'].value = new Date(resp['table_config']['dueDate'].value);
                }
                if (resp['table_config']['expiryDate'].value) {
                    resp['table_config']['expiryDate'].value = new Date(resp['table_config']['expiryDate'].value);
                }
                this.primengTable['filters'] = resp['table_config'];
                this.isFilterShowTravel = true;
                this.primengTable._filter();
            });

            // ngAfterViewInit
            if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
                this.isFilterShowTravel = true;

                let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
                if (filterData['table_config']['dueDate'].value) {
                    filterData['table_config']['dueDate'].value = new Date(filterData['table_config']['dueDate'].value);
                }
                if (filterData['table_config']['expiryDate'].value) {
                    filterData['table_config']['expiryDate'].value = new Date(filterData['table_config']['expiryDate'].value);
                }

                this.primengTable['filters'] = filterData['table_config'];
            }
        }

        if (this.agentList && !this.agentList.length) {
            this.getAgent("");
        }
    }

    refreshItems(event?: any): void {
        this.isLoading = true;

        const filterReq = this.getNewFilterReq(event);
        filterReq['Filter'] = this.searchInputControlTravel.value;
        this.crmService.getTravelCollectionList(filterReq).subscribe({
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

    getAgent(value: string) {
        this.agentService.getAgentCombo(value).subscribe((data) => {
            this.agentList = data;

            for (let i in this.agentList) {
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

    dialCall(record: any): void {
        if (!Security.hasPermission(travelCollectionPermissions.dailCallPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(DialTravelCallListComponent, {
            data: { data: record, readonly: true },
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

        this.matDialog.open(DialTravelCallListComponent, {
            data: { data: record, readonly: true, selectedTabIndex: 3 },
            disableClose: true
        }).afterClosed().subscribe({
            next: (res) => {
                this.refreshItems();
            }
        })
    }

    sendReminderEmail(record: any): void {
        const label: string = 'Send Reminders WA/Email';
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.name + ' ?',
        }).afterClosed().subscribe((res) => {
            if (res === 'confirmed') {
                const payload = {
                    agent_id: record?.agentid
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

    purchaseProduct(record: any): void {
        if (!Security.hasPermission(partnerPurchaseProductPermissions.purchaseProductPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(PurchaseProductComponent, {
            width: '1000px',
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    timeline(record: any): void {
        // if (!Security.hasPermission(agentPermissions.marketingMaterialPermissions)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }
        // this.matDialog.open(MarketingMaterialsComponent, {
        //     data: { data: record, readonly: true },
        //     disableClose: true
        // });
    }

    ngOnDestroy() {
        if (this.settingsTravelSubscription) {
            this.settingsTravelSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }

}
