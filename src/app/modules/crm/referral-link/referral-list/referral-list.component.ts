import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, filter_module_name, messages, module_name } from 'app/security';
import { RefferralService } from 'app/services/referral.service';
import { ToasterService } from 'app/services/toaster.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { EntityService } from 'app/services/entity.service';
import { ReferralSettingsComponent } from '../referral-entry-settings/referral-entry-settings.component';
import { takeUntil } from 'rxjs';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'app-referral-list',
    templateUrl: './referral-list.component.html',
    styleUrls: ['./referral-list.component.scss'],
    styles: [],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        ReactiveFormsModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatProgressBarModule,
        MatTableModule,
        MatFormFieldModule,
        MatMenuModule,
        MatDialogModule,
        MatTooltipModule,
        MatDividerModule,
        CommonModule,
        MatTabsModule,
        ReferralSettingsComponent,
        PrimeNgImportsModule
    ]
})
export class ReferralListComponent extends BaseListingComponent {

    module_name = module_name.Referrallink;
    filter_table_name = filter_module_name.referral_link;
    private settingsUpdatedSubscription: Subscription;
    dataList = [];
    isFilterShow: boolean = false;
    employeeList: any[] = [];
    selectedRm: any;

    linkList: any[] = [
        { value: 'B2B Partner', label: 'B2B Partner' },
        { value: 'WL', label: 'WL' },
        { value: 'Corporate', label: 'Corporate' },
        { value: 'Supplier', label: 'Supplier' },
        { value: 'API', label: 'API' },
    ];

    cols = [];

    constructor(
        public alertService: ToasterService,
        private conformationService: FuseConfirmationService,
        private toasterService: ToasterService,
        private refferralService: RefferralService,
        private clipboard: Clipboard,
        private entityService: EntityService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.Referrallink)
        this.key = this.module_name;
        this.sortColumn = 'entry_date_time';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);

        this.entityService.onrefreshreferralEntityCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                if (item) {
                    this.refreshItems();
                }
            }
        })
    }

    ngOnInit(): void {
        this.getEmployeeList("");

        // common filter
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.selectedRm = resp['table_config']['rm_id_filtres']?.value;
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['entry_date_time'].value) {
                resp['table_config']['entry_date_time'].value = new Date(resp['table_config']['entry_date_time'].value);
            }
            if (resp['table_config']['start_date'].value) {
                resp['table_config']['start_date'].value = new Date(resp['table_config']['start_date'].value);
            }
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShow = true;
            this.primengTable._filter();
        });
    }

    ngAfterViewInit() {
        // Defult Active filter show
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShow = true;
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            this.selectedRm = filterData['table_config']['rm_id_filtres']?.value;
            if (filterData['table_config']['entry_date_time'].value) {
                filterData['table_config']['entry_date_time'].value = new Date(filterData['table_config']['entry_date_time'].value);
            }
            if (filterData['table_config']['start_date'].value) {
                filterData['table_config']['start_date'].value = new Date(filterData['table_config']['start_date'].value);
            }
            this.primengTable['filters'] = filterData['table_config'];
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
        }
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        this.refferralService.getReferralLinkList(this.getNewFilterReq(event)).subscribe({
            next: data => {
                this.isLoading = false;
                this.dataList = data.data;
                this.totalRecords = data.total;
            }, error: err => {
                this.isLoading = false;
            }
        })
    }

    // Api to get the Employee list data
    getEmployeeList(value: string) {
        this.refferralService.getEmployeeLeadAssignCombo(value).subscribe((data: any) => {
            this.employeeList = data;
        });
    }

    edit(record): void {
        if (!Security.hasEditEntryPermission(module_name.Referrallink)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        // this.matDialog
        //     .open(ReferralEditComponent, {
        //         data: { data: record, readonly: true },
        //         disableClose: true,
        //     })
        //     .afterClosed()
        //     .subscribe((res) => {
        //         if (res) {
        //             this.refreshItems();
        //         }
        //     });
        this.entityService.raisereferralEntityCall({ data: record, edit: true })
    }

    createReferral(): void {
        if (!Security.hasNewEntryPermission(module_name.Referrallink)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        // this.matDialog.open(ReferralEntryComponent,
        //     { data: null })
        //     .afterClosed()
        //     .subscribe((res) => {
        //         if (res) {
        //             this.alertService.showToast(
        //                 'success',
        //                 'New record added',
        //                 'top-right',
        //                 true
        //             );
        //             this.refreshItems();
        //         }
        //     });
        this.entityService.raisereferralEntityCall({ create: true })
    }

    deleteInternal(record): void {
        if (!Security.hasNewEntryPermission(module_name.Referrallink)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Delete Referral Link'
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.referral_link + ' ?'
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.refferralService.delete(record.id).subscribe({
                    next: () => {
                        this.alertService.showToast('success', "Referral Link has been deleted!", "top-right", true);
                        this.refreshItems()
                    }
                })
            }
        })
    }

    linkCopy(link) {
        this.clipboard.copy(link);
        this.toasterService.showToast('success', 'Copied');
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    ngOnDestroy(): void {
        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }
}
