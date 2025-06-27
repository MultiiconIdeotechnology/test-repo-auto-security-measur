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
import { RouterOutlet } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AppConfig } from 'app/config/app-config';
import { Security, filter_module_name, messages, module_name, techDashPermissions } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject, takeUntil } from 'rxjs';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { AgentService } from 'app/services/agent.service';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { GlobalSearchService } from 'app/services/global-search.service';
import { DomainSslVerificationComponent } from '../../domain-ssl-verification/domain-ssl-verification.component';
import { TechInfoTabsComponent } from '../../info-tabs/info-tabs.component';
import { PendingLinkComponent } from '../../pending-link/pending-link.component';
import { MobileProductActivateDialogComponent } from '../../domain-ssl-verification/mobile-product-activate-dialog/mobile-product-activate-dialog.component';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';

@Component({
    selector: 'app-crm-tech-dashboard-domain',
    standalone: true,
    imports: [
        DatePipe,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        RouterOutlet,
        MatOptionModule,
        MatCheckboxModule,
        CommonModule,
        TechInfoTabsComponent,
        PrimeNgImportsModule,
        MatMenuModule
    ],
    templateUrl: './domain.component.html',
    styleUrls: ['./domain.component.scss']
})
export class TechDashboardDomainComponent extends BaseListingComponent {
    @Input() isFilterShowDomain: boolean;
    @Output() isFilterShowDomainChange = new EventEmitter<boolean>();
    @Input() dropdownFirstCallObj: any;

    Mainmodule: any;
    module_name = module_name.techDashboard;
    filter_table_name = filter_module_name.tech_dashboard_pending;
    private settingsUpdatedSubscription: Subscription;
    cols = [];
    dataList = [];
    getWLSettingList: any = [];
    searchInputControlDomain = new FormControl('');
    deadLeadId: any;
    statusList = ['Pending', 'Inprocess', 'Delivered', 'Google Closed Testing', 'Waiting for Customer Update', 'Waiting for Account Activation', 'Rejected from Store',];
    isLoading = false;
    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;
    total = 0;
    appConfig = AppConfig;
    data: any
    selectedAgent: any;
    agentList: any[] = [];
    filter: any = {}
    isPointingList: any[] = [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
    ];

    selection: any[] = [];

    constructor(
        private crmService: CrmService,
        private sidebarDialogService: SidebarCustomModalService,
        public _filterService: CommonFilterService,
        public globalSearchService: GlobalSearchService
    ) {
        super(module_name.techDashboard);
        this.key = this.module_name;
        this.sortColumn = 'ssl_expire_date_time';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit(): void {
        this.sidebarDialogService.onModalChange().pipe(takeUntil(this._unsubscribeAll)).subscribe((res:any) => {
            if(res && res.key == 'crm-domain-generate-success') {
                this.refreshItems();
            }
        })

        this._filterService.updateSelectedOption('');
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            if (resp['table_config']['ssl_expire_date_time']?.value != null && resp['table_config']['ssl_expire_date_time'].value.length) {
                this._filterService.updateSelectedOption('custom_date_range');
                this._filterService.rangeDateConvert(resp['table_config']['ssl_expire_date_time']);
            }

            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShowDomain = true;
            this.isFilterShowDomainChange.emit(this.isFilterShowDomain);
            this.primengTable._filter();
        });
    }

    ngAfterViewInit() {
        // Defult Active filter show
        this._filterService.updateSelectedOption('');
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShowDomain = true;
            this.isFilterShowDomainChange.emit(this.isFilterShowDomain);
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            if (filterData['table_config']['ssl_expire_date_time']?.value != null && filterData['table_config']['ssl_expire_date_time'].value.length) {
                this._filterService.updateSelectedOption('custom_date_range');
                this._filterService.rangeDateConvert(filterData['table_config']['ssl_expire_date_time']);
            }

            this.primengTable['filters'] = filterData['table_config'];
            this.primengTable['_sortField'] = filterData['sortColumn'];
            this.sortColumn = filterData['sortColumn'];
        }
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        const filterReq = this.getNewFilterReq(event);
        filterReq['Filter'] = this.searchInputControlDomain.value;

        this.crmService.getTechDomainProductList(filterReq).subscribe({
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

    info(record: any): void {
        this.sidebarDialogService.openModal('crm-domain-info', record);
    }

    toggleSelection(row: any) {
        const index = this.selection.findIndex(u => u.id === row.id);
        if (index >= 0) {
            this.selection.splice(index, 1);
        } else {
            this.selection.push({ AgentId: row?.agent_id, DomainName: row?.domain_name, id: row.id });
        }
    }

    openSelectedDomain() {
        this.sidebarDialogService.openModal('crm-selected-domain', this.selection);
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControlDomain.value)
            return `no search results found for \'${this.searchInputControlDomain.value}\'.`;
        else return 'No data to display';
    }

    exportExcel(): void {
        // if (!Security.hasExportDataPermission(this.module_name)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }

        let filterReq = this.getNewFilterReq({});
        filterReq["Filter"] = this.searchInputControlDomain.value;
        filterReq['Skip'] = 0;
        filterReq['Take'] = this.totalRecords;

        this.crmService.getTechDomainProductList(filterReq).subscribe(data => {
            for (var dt of data.data) {
                // dt.amendment_request_time = DateTime.fromISO(dt.amendment_request_time).toFormat('dd-MM-yyyy HH:mm:ss')
                dt.ssl_expire_date_time = dt.ssl_expire_date_time ? DateTime.fromISO(dt.ssl_expire_date_time).toFormat('dd-MM-yyyy') : '';
                dt.is_domain_pointed = dt.is_domain_pointed ? 'Yes' : 'No';
            }

            Excel.export(
                'Domain',
                [
                    // { header: 'Code', property: 'agent_code' },
                    { header: 'Agent Code', property: 'Agent Code' },
                    { header: 'Domain Name', property: 'domain_name' },
                    { header: 'IP Address', property: 'ip_address' },
                    { header: 'SSL Expiry Date', property: 'ssl_expire_date_time' },
                    { header: 'Is Pointing', property: 'is_domain_pointed' },
                ],
                data.data, "Domain", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 17 } }]);
        });
    }


    ngOnDestroy(): void {

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }
}
