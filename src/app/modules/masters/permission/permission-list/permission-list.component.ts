import { Security, messages, module_name, permissionMasterPermissions } from 'app/security';
import { Component } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { PermissionEntryComponent } from '../permission-entry/permission-entry.component';
import { PermissionService } from 'app/services/permission.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';

@Component({
    selector: 'app-permission-list',
    templateUrl: './permission-list.component.html',
    styles: [`
    .tbl-grid {
      grid-template-columns:  40px 130px 200px 120px 180px 180px 210px;
    }
    `],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatInputModule,
        MatButtonModule,
        MatTooltipModule,
        PrimeNgImportsModule
    ],
})
export class PermissionListComponent extends BaseListingComponent {
    module_name = module_name.permission;
    dataList = [];
    total = 0;

    columns = [
        {
            key: 'module_name',
            name: 'Module',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: true,
            is_boolean: false,
            tooltip: true
        },
        {
            key: 'operation_type',
            name: 'Operation',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            is_boolean: false,
            tooltip: true
        },
        {
            key: 'group_name',
            name: 'Group',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            is_boolean: false,
            tooltip: true
        },
        {
            key: 'category_name',
            name: 'Category',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            is_boolean: false,
            tooltip: true
        },
        {
            key: 'login_area',
            name: 'Login Area',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            is_boolean: false,
            tooltip: true
        },
        {
            key: 'description',
            name: 'Description',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            is_boolean: false,
            tooltip: true
        },
    ];
    isFilterShow: boolean = false;


    constructor(
        private conformationService: FuseConfirmationService,
        private permissionService: PermissionService,
        private matDialog: MatDialog,
        private toasterService: ToasterService
    ) {
        super(module_name.permission);
        // this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'module_name';
        this.sortDirection = 'asc';
        this.Mainmodule = this;
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        this.permissionService
            .getPermissionList(this.getNewFilterReq(event))
            .subscribe({
                next: (data) => {
                    this.isLoading = false;
                    this.dataList = data.data;
                    this.totalRecords = data.total;
                },
                error: (err) => {
                    this.alertService.showToast(
                        'error',
                        err,
                        'top-right',
                        true
                    );
                    this.isLoading = false;
                },
            });
    }

    createInternal(model): void {
        this.matDialog.open(PermissionEntryComponent,
            { data: null, disableClose: true, })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.alertService.showToast(
                        'success',
                        'New record added',
                        'top-right',
                        true
                    );
                    this.refreshItems();
                }
            });
    }

    editInternal(record): void {
        this.matDialog
            .open(PermissionEntryComponent, {
                data: { data: record, readonly: false },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.alertService.showToast(
                        'success',
                        'Record modified',
                        'top-right',
                        true
                    );
                    this.refreshItems();
                }
            });
    }

    viewInternal(record): void {
        this.matDialog.open(PermissionEntryComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    deleteInternal(record): void {
        const label: string = 'Delete Permission';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.module_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.permissionService.delete(record.id).subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'success',
                                'Permission has been deleted!',
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

    SetDefault(record): void {
        if (!Security.hasPermission(permissionMasterPermissions.isDefaultPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Set Default Permission';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.module_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.permissionService.setDefault(record.id).subscribe({
                        next: () => {
                            this.refreshItems();
                            this.toasterService.showToast(
                                'success',
                                'Permission as Default!'
                            );
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
        // this.masterService.setData(this.key, this);
    }
}
