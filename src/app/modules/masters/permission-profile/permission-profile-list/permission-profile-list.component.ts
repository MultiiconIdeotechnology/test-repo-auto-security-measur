import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { Security, messages, module_name, permissionProfilePermissions } from 'app/security';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { AppliedOnDialogComponent } from '../applied-on-dialog/applied-on-dialog.component';
import { PermissionProfileEntryComponent } from '../permission-profile-entry/permission-profile-entry.component';
import { ToasterService } from 'app/services/toaster.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PermissionProfileService } from 'app/services/permission-profile.service';
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
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'app-permission-profile-list',
    templateUrl: './permission-profile-list.component.html',
    styles: [],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        CommonModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatInputModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatTooltipModule,
        PrimeNgImportsModule
    ],
})
export class PermissionProfileListComponent extends BaseListingComponent {
    module_name = module_name.permissionProfile;
    dataList = [];
    total = 0;

    columns = [
        {
            key: 'profile_name',
            name: 'Profile Name',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: true,
            is_boolean: false,
            applied: false,
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
            applied: false,
            tooltip: true
        },
        {
            key: 'applied_on',
            name: 'Applied On',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            is_boolean: false,
            applied: true,
            tooltip: true
        },
        {
            key: '.',
            name: '',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            is_boolean: false,
            applied: false,
            tooltip: true
        },
        {
            key: '..',
            name: '',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            is_boolean: false,
            applied: false,
            tooltip: true
        },
    ];
    cols = [];
    isFilterShow: boolean = false;


    constructor(
        private conformationService: FuseConfirmationService,
        private permissionProfileService: PermissionProfileService,
        private router: Router,
        private matDialog: MatDialog,
        private toasterService: ToasterService
    ) {
        super(module_name.permissionProfile);
        // this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'profile_name';
        this.sortDirection = 'asc';
        this.Mainmodule = this;
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        this.permissionProfileService
            .getPermissionProfileList(this.getNewFilterReq(event))
            .subscribe({
                next: (data) => {
                    this.isLoading = false;
                    this.dataList = data.data;
                    // this._paginator.length = data.total;
                    this.totalRecords = data.total;
                    this.dataList.forEach((row) => {
                        row['applied_on'] = row['applied_on_list'].length;
                    });
                },
                error: (err) => {
                    this.alertService.showToast('error', err, 'top-right', true);
                    this.isLoading = false;
                },
            });
    }

    createInternal(model): void {
        this.matDialog.open(PermissionProfileEntryComponent, {
            data: null,
            disableClose: true,
        })
            .afterClosed().subscribe((res) => {
                if (res) {
                    this.alertService.showToast('success', 'New record added', 'top-right', true);
                    this.refreshItems();
                }
            });
    }

    editInternal(record): void {
        this.matDialog.open(PermissionProfileEntryComponent, {
            data: { data: record, readonly: false },
            disableClose: true,
        })
            .afterClosed().subscribe((res) => {
                if (res) {
                    this.alertService.showToast('success', 'Record modified', 'top-right', true);
                    this.refreshItems();
                }
            });
    }

    viewInternal(record): void {
        this.matDialog.open(PermissionProfileEntryComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    deleteInternal(record): void {
        const label: string = 'Delete Permission';
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.profile_name + ' ?',
        })
            .afterClosed().subscribe((res) => {
                if (res === 'confirmed') {
                    this.permissionProfileService.delete(record.id).subscribe({
                        next: () => {
                            this.alertService.showToast('success', 'Permission Profile has been deleted!', 'top-right', true);
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
        if (!Security.hasPermission(permissionProfilePermissions.isDefaultPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Set Default Permission Profile';
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.profile_name + ' ?',
        })
            .afterClosed().subscribe((res) => {
                if (res === 'confirmed') {
                    this.permissionProfileService
                        .setDefault(record.id)
                        .subscribe({
                            next: () => {
                                this.refreshItems();
                                this.toasterService.showToast('success', 'Permission Profile as Default!');
                            },
                            error: (err) => {
                                this.alertService.showToast('error', err, 'top-right', true);

                            },
                        });
                }
            });
    }

    public applyPermission(id: string): void {
        if (!Security.hasPermission(permissionProfilePermissions.applyPermissionPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // if (!Security.hasPermission(permissionProfilePermissions.apply_permission)) {
        //   return this.alertService.error(messages.permissionDenied);
        // }
        this.router.navigate([
            '/hr/permission-profile/permission-profile-permissions/' + id,
        ]);
    }

    openloginAreaListDialog(rowData: any) {
        const assignedToList = rowData['applied_on_list'];
        const loginArea = rowData['login_area'];

        if (assignedToList.length <= 0) return;
        this.matDialog.open(AppliedOnDialogComponent, {
            disableClose: true,
            data: { assignedToList, loginArea },
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
