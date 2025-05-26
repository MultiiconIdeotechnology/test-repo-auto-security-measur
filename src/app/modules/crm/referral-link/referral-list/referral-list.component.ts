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
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { Security, filter_module_name, messages, module_name } from 'app/security';
import { RefferralService } from 'app/services/referral.service';
import { ToasterService } from 'app/services/toaster.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { EntityService } from 'app/services/entity.service';
import { ReferralSettingsComponent } from '../referral-entry-settings/referral-entry-settings.component';
import { Subject, takeUntil } from 'rxjs';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { ReferralListInfoComponent } from './referral-list-info/referral-list-info.component';
import { ReferralListEntryComponent } from './referral-list-entry/referral-list-entry.component';
import { DataManagerService } from 'app/services/data-manager.service';
import { ReferralListSpentDialogComponent } from './referral-list-spent-dialog/referral-list-spent-dialog.component';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';

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
        PrimeNgImportsModule,
        ReferralListInfoComponent,
        ReferralListEntryComponent,
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
    selectedColumns: Column[];
    destroy$ = new Subject<any>();

    linkList: any[] = [
        { value: 'B2B Partner', label: 'B2B Partner' },
        { value: 'WL', label: 'WL' },
        { value: 'Corporate', label: 'Corporate' },
        { value: 'Supplier', label: 'Supplier' },
        { value: 'API', label: 'API' },
    ];

    campaignCategoryList: string[] = ['Performance', 'Organic', 'Direct', 'Influencer'];

    actionList: any[] = [
        { label: 'Active', value: true },
        { label: 'Deactive', value: false },
    ]

    statusList: any = [
        { label: 'Live', value: 'Live' },
        { label: 'Pause', value: 'Pause' }
    ];

    statusColorMap: any = {
        'Live': 'text-green-600',
        'Pause': 'text-red-600'
    }

    // statusList: any[] = []

    cols: Column[] = [
        { field: 'entry_by_name', header: 'Entry By' },
        { field: 'referral_link', header: 'Link' }
    ];

    constructor(
        public alertService: ToasterService,
        private conformationService: FuseConfirmationService,
        private toasterService: ToasterService,
        private refferralService: RefferralService,
        private clipboard: Clipboard,
        public _filterService: CommonFilterService,
        private sidebarDialogService: SidebarCustomModalService,
        private dataManagerService: DataManagerService,
        private matDialog: MatDialog,
    ) {
        super(module_name.Referrallink)
        this.key = this.module_name;
        this.sortColumn = 'entry_date_time';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit(): void {
        // this.getEmployeeList("");
        this._filterService.rmListSubject$.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
            this.employeeList = res;
        })

        this.dataManagerService.dataList$.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
            this.dataList = res;
        })

        // common filter
        this._filterService.updateSelectedOption('');
        this._filterService.updatedSelectionOptionTwo('');
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.selectedRm = resp['table_config']['relationship_manager_name']?.value;
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['start_date']?.value != null && resp['table_config']['start_date'].value.length) {
                this._filterService.updateSelectedOption('custom_date_range');
                this._filterService.rangeDateConvert(resp['table_config']['start_date']);
            }
            if (resp['table_config']['entry_date_time']?.value != null && resp['table_config']['entry_date_time'].value.length) {
                this._filterService.updatedSelectionOptionTwo('custom_date_range');
                this._filterService.rangeDateConvert(resp['table_config']['entry_date_time']);
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
            this.selectedRm = filterData['table_config']['relationship_manager_name']?.value;
            if (filterData['table_config']['start_date']?.value != null && filterData['table_config']['start_date'].value.length) {
                this._filterService.updateSelectedOption('custom_date_range');
                this._filterService.rangeDateConvert(filterData['table_config']['start_date']);
            }
            if (filterData['table_config']['entry_date_time']?.value != null && filterData['table_config']['entry_date_time'].value.length) {
                this._filterService.updatedSelectionOptionTwo('custom_date_range');
                this._filterService.rangeDateConvert(filterData['table_config']['entry_date_time']);
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
                this.dataManagerService.setInitialData(this.dataList);
                this.totalRecords = data.total;
            }, error: err => {
                this.isLoading = false;
            }
        })
    }

    info(record: any) {
        this.sidebarDialogService.openModal('info', record);
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
        this.sidebarDialogService.openModal('edit', record)
    }

    createReferral(): void {
        if (!Security.hasNewEntryPermission(module_name.Referrallink)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        this.sidebarDialogService.openModal('create', null)
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
                        let index = this.dataList.findIndex((item: any) => item.id == record.id);
                        this.dataList.splice(index, 1);
                    }
                })
            }
        })
    }

    linkCopy(data: any) {
        if (data.status == 'Live') {
            this.clipboard.copy(data.referral_link);
            this.toasterService.showToast('success', 'Copied');
        }
    }

    spent(record: any) {
        this.matDialog.open(ReferralListSpentDialogComponent, {
            data: record,
            panelClass: 'custom-dialog-modal',
            backdropClass: 'custom-dialog-backdrop',
            disableClose: true
        }).afterClosed().subscribe(res => {
            if (res) {
                // this.refreshItems();
            }
        })
    }

    // setReferalLinkEnable(data: any): void {
    //     // if (!Security.hasPermission(walletRechargePermissions.auditUnauditPermissions)) {
    //     // 	return this.alertService.showToast('error', messages.permissionDenied);
    //     // }

    //     const label: string = data.is_enable ? 'Deactivate Referral Link' : 'Activate Referral Link';
    //     this.conformationService.open({
    //         title: label,
    //         message: 'Are you sure to ' + label.toLowerCase() + ' ?'
    //     }).afterClosed().subscribe({
    //         next: (res) => {
    //             if (res === 'confirmed') {
    //                 this.refferralService.setReferalLinkEnable(data.id).subscribe({
    //                     next: () => {
    //                         if (!data.is_enable) {
    //                             this.alertService.showToast('success', "Referral Link has been activated.", "top-right", true);
    //                         } else {
    //                             this.alertService.showToast('success', "Referral Link has been deactivated.", "top-right", true);
    //                         }

    //                         data.is_enable = !data.is_enable;

    //                     }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
    //                 });
    //             }
    //         }
    //     })

    // }

    changeStatus(data: any): void {
        // if (!Security.hasPermission(walletRechargePermissions.auditUnauditPermissions)) {
        // 	return this.alertService.showToast('error', messages.permissionDenied);
        // }

        const isCurrentlyLive = data?.status === 'Live';
        const newStatus = isCurrentlyLive ? 'Pause' : 'Live';

        this.conformationService.open({
            title: newStatus,
            message: `Are you sure you want to update status to ${newStatus}?`
        }).afterClosed().subscribe({
            next: (res) => {
                if (res === 'confirmed') {
                    const payload = { id: data?.id, status: newStatus };

                    this.refferralService.statusChange(payload).subscribe({
                        next: () => {
                            data.status = newStatus; // ✅ update the status directly
                            this.alertService.showToast(
                                'success',
                                `Status set to ${newStatus}`,
                                'top-right',
                                true
                            );
                        },
                        error: (err) => this.alertService.showToast('error', err, 'top-right', true)
                    });
                }
            }
        });

    }

    exportExcel() {
        if (!Security.hasExportDataPermission(this.module_name)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const filterReq = this.getNewFilterReq({})
        filterReq['Take'] = this.totalRecords;

        this.refferralService.getReferralLinkList(filterReq).subscribe((resp) => {
            for (var dt of resp.data) {
                dt.start_date = dt.start_date ? DateTime.fromISO(dt.start_date).toFormat('dd-MM-yyyy') : '';
                dt.entry_date_time = dt.entry_date_time ? DateTime.fromISO(dt.entry_date_time).toFormat('dd-MM-yyyy') : '';
            }
            Excel.export(
                'Referral Link',
                [
                    { header: 'Code', property: 'referral_code' },
                    { header: 'Category', property: 'campaign_category' },
                    { header: 'Type', property: 'referral_link_for' },
                    { header: 'Status', property: 'status' },
                    { header: 'RM', property: 'relationship_manager_name' },
                    { header: 'Title', property: 'campaign_name' },
                    { header: 'Start Date', property: 'start_date' },
                    { header: 'Entry Time', property: 'entry_date_time' },
                    { header: 'Entry By', property: 'entry_by_name' },
                    { header: 'Link', property: 'referral_link' },
                ],
                resp.data,
                'Referral Link',
                [{ s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }]
            );
        });
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

        this.destroy$.next(null);
        this.destroy$.complete();
    }
}
