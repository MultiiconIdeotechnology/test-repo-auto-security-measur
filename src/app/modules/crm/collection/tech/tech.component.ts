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
import { Security, filter_module_name, messages, module_name, partnerPurchaseProductPermissions, techCollectionPermissions } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject, Subscription } from 'rxjs';
import { PurchaseProductComponent } from '../../agent/purchase-product/purchase-product.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DialTechCallListComponent } from '../tech-dial-call-list/tech-dial-call-list.component';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AgentService } from 'app/services/agent.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'app-tech',
    templateUrl: './tech.component.html',
    // styles: [],
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
export class TechCollectionComponent extends BaseListingComponent {
    @Input() isFilterShowTech: boolean;
    @Input() dropdownListObj: {};
    @Input() activeTab: any;

    agentList: any[] = [];
    selectedAgent: any = {};
    public settingsTechSubscription: Subscription;

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
    filter_table_name = filter_module_name.collections_tech;

    total = 0;
    appConfig = AppConfig;
    data: any
    filter: any = {}
    formattedDate: string = '';

    constructor(
        private crmService: CrmService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        private agentService: AgentService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.techDashboard)
        this.key = this.module_name;
        this.sortColumn = 'installmentDate';
        this.sortDirection = 'desc';
        this.Mainmodule = this
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit(): void {

    }

    ngAfterViewInit() {

    }

    ngOnChanges() {
        if (this.activeTab == 'Tech') {
            this.settingsTechSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
                this.selectedAgent = resp['table_config']['agencyName']?.value;
                const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                if (!match) {
                    this.agentList.push(this.selectedAgent);
                }
                this.sortColumn = resp['sortColumn'];
                this.primengTable['_sortField'] = resp['sortColumn'];
                if (resp['table_config']['lastCallDate'].value) {
                    resp['table_config']['lastCallDate'].value = new Date(resp['table_config']['lastCallDate'].value);
                }
                if (resp['table_config']['installmentDate'].value) {
                    resp['table_config']['installmentDate'].value = new Date(resp['table_config']['installmentDate'].value);
                }
                this.primengTable['filters'] = resp['table_config'];
                this.isFilterShowTech = true;
                this.primengTable._filter();
            });

            // ngAfterviewinit
            // Defult Active filter show
            if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
                this.isFilterShowTech = true;
                let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
                this.selectedAgent = filterData['table_config']['agencyName']?.value;

                if (this.selectedAgent && this.selectedAgent?.id) {
                    const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
                    if (!match) {
                        this.agentList.push(this.selectedAgent);
                    }
                }
                if (filterData['table_config']['lastCallDate'].value) {
                    filterData['table_config']['lastCallDate'].value = new Date(filterData['table_config']['lastCallDate'].value);
                }
                if (filterData['table_config']['installmentDate'].value) {
                    filterData['table_config']['installmentDate'].value = new Date(filterData['table_config']['installmentDate'].value);
                }

                setTimeout(() => {
                    this.primengTable['filters'] = filterData['table_config'];
                    this.primengTable['_sortField'] = filterData['sortColumn'];
                }, 1000);
                this.sortColumn = filterData['sortColumn'];
            }
        }
        if (this.agentList && !this.agentList.length) {
            this.getAgent("");
        }
    }


    refreshItems(event?: any): void {
        this.isLoading = true;
        const filterReq = this.getNewFilterReq(event);
        filterReq['Filter'] = this.searchInputControlTech.value;

        this.crmService.getTechCollectionList(filterReq).subscribe({
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
        this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
            this.agentList = data;

            // if (this.selectedAgent && this.selectedAgent?.id) {
            //     const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
            //     if (!match) {
            //         this.agentList.push(this.selectedAgent);
            //     }
            // }

            for (let i in this.agentList) {
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`;
                this.agentList[i].id_by_value = this.agentList[i].agency_name;
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

        this.matDialog.open(DialTechCallListComponent, {
            data: { data: record, readonly: true },
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

        this.matDialog.open(DialTechCallListComponent, {
            data: { data: record, readonly: true, selectedTabIndex: 3 },
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

    ngOnDestroy() {
        if (this.settingsTechSubscription) {
            this.settingsTechSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }
}
