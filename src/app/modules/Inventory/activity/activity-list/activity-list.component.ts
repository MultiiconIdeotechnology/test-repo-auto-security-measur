import { Component } from '@angular/core';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { Routes } from 'app/common/const';
import { Security, activityPermissions, filter_module_name, messages, module_name } from 'app/security';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivityService } from 'app/services/activity.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ToasterService } from 'app/services/toaster.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'app-activity-list',
    templateUrl: './activity-list.component.html',
    styles: [],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatProgressBarModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatMenuModule,
        MatDialogModule,
        MatTooltipModule,
        MatDividerModule,
        PrimeNgImportsModule
    ],
})
export class ActivityListComponent extends BaseListingComponent {
    module_name = module_name.activity;
    // Variable
    filter_table_name = filter_module_name.activity;
    private settingsUpdatedSubscription: Subscription;
    dataList = [];
    total = 0;

    columns = [
        {
            key: 'activity_name',
            name: 'Activity',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: true,
            is_required: false,
            is_included: false,
            tooltip: true,
        },
        {
            key: 'city_name',
            name: 'City',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            is_required: false,
            is_included: false,
            tooltip: true,
        },
        {
            key: 'is_ticket_required',
            name: 'Ticket',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: 'header-center-view',
            is_sticky: false,
            align: 'center',
            indicator: false,
            is_required: false,
            is_included: false,
            is_boolean: true,
            tooltip: true,
        },
        {
            key: 'is_sightseeing_combo',
            name: 'Combo',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: 'header-center-view',
            is_sticky: false,
            align: 'center',
            indicator: false,
            is_required: false,
            is_included: false,
            is_boolean: true,
            tooltip: true,
        },
        {
            key: 'preferred_time',
            name: 'Preferred Time',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            is_required: false,
            is_included: false,
            tooltip: true,
        },
        {
            key: 'is_meal_included',
            name: 'Meal',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: 'header-center-view',
            is_sticky: false,
            align: 'center',
            indicator: false,
            is_required: false,
            is_included: false,
            is_boolean: true,
            tooltip: true,
        },
        {
            key: 'entry_date_time',
            name: 'Entry',
            is_date: true,
            date_formate: 'dd-MM-yyyy HH:mm:ss',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            is_required: false,
            is_included: false,
            tooltip: true,
        },
    ];

    actionList = [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
    ];

    cols = [];
    isFilterShow: boolean = false;


    constructor(
        private activityService: ActivityService,
        private toasterService: ToasterService,
        private conformationService: FuseConfirmationService,
        public _filterService: CommonFilterService,
        private router: Router
    ) {
        super(module_name.activity);
        // this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'entry_date_time';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit(): void {
        // ngOnInit()
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.sortColumn = resp['sortColumn'];
            this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['entry_date_time'].value) {
                resp['table_config']['entry_date_time'].value = new Date(resp['table_config']['entry_date_time'].value);
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
            if (filterData['table_config']['entry_date_time'].value) {
                filterData['table_config']['entry_date_time'].value = new Date(filterData['table_config']['entry_date_time'].value);
            }
            this.primengTable['filters'] = filterData['table_config'];
            this.primengTable['_sortField'] = filterData['sortColumn'];
            this.sortColumn = filterData['sortColumn'];
        }
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        this.activityService.getActivityList(this.getNewFilterReq(event)).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                // this._paginator.length = data.total;
                this.totalRecords = data.total;

            },
            error: (err) => {
                this.toasterService.showToast('error', err)
                this.isLoading = false;
            },
        });
    }

    createInternal(model): void {
        this.router.navigate([Routes.inventory.activity_form_entry_route]);
    }

    editInternal(record): void {
        this.router.navigate([
            Routes.inventory.activity_form_entry_route + '/' + record.id,
        ]);
    }

    viewInternal(record): void {
        this.router.navigate([
            Routes.inventory.activity_form_entry_route +
            '/' +
            record.id +
            '/readonly',
        ]);
    }

    deleteInternal(record): void {
        const label: string = 'Delete Activity';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.activity_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.activityService.delete(record.id).subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'success',
                                'Activity has been deleted!',
                                'top-right',
                                true
                            );
                            this.refreshItems();
                        },
                        error: (err) => {
                            this.alertService.showToast('error', err, 'top-right', true);

                        },
                    });
                }
            });
    }

    AuditUnaudit(record): void {
        if (!Security.hasPermission(activityPermissions.auditUnauditPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = record.is_audited
            ? 'Unaudit Activity'
            : 'Audit Activity';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.activity_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.activityService.setAuditUnaudit(record.id).subscribe({
                        next: () => {
                            record.is_audited = !record.is_audited;
                            if (record.is_audited) {
                                this.alertService.showToast(
                                    'success',
                                    'Activity has been Audited!',
                                    'top-right',
                                    true
                                );
                            } else {
                                this.alertService.showToast(
                                    'success',
                                    'Activity has been Unaudited!',
                                    'top-right',
                                    true
                                );
                            }
                        },
                        error: (err) => {
                            this.alertService.showToast('error', err, 'top-right', true);

                        },
                    });
                }
            });
    }

    EnableDisable(record): void {
        if (!Security.hasPermission(activityPermissions.enableDisablePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = record.is_disabled
            ? 'Enable Activity'
            : 'Disable Activity';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.activity_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.activityService.setEnableDisable(record.id).subscribe({
                        next: () => {
                            record.is_disabled = !record.is_disabled;
                            if (record.is_disabled) {
                                this.alertService.showToast(
                                    'success',
                                    'Activity has been Disabled!',
                                    'top-right',
                                    true
                                );
                            } else {
                                this.alertService.showToast(
                                    'success',
                                    'Activity has been Enabled!',
                                    'top-right',
                                    true
                                );
                            }
                        },
                        error: (err) => {
                            this.alertService.showToast('error', err, 'top-right', true);

                        },
                    });
                }
            });
    }

    getNodataText(): string {
        if (this.isLoading) return 'Loading...';
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
