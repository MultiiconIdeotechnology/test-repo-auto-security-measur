import { WorkingStatusComponent } from './../dialogs/working-status/working-status.component';
import { MatMenuModule } from '@angular/material/menu';
import { EmployeeService } from './../../../../services/employee.service';
import { Component, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { Security, employeePermissions, messages, module_name } from 'app/security';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Routes } from 'app/common/const';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDividerModule } from '@angular/material/divider';
import { PermissionProfileDiaComponent } from '../dialogs/permission-profile-dia/permission-profile-dia.component';
import { EmployeeKycInfoComponent } from '../employee-kyc-info/employee-kyc-info.component';
import { KycProfileDialogComponent } from '../kyc-profile-dialog/kyc-profile-dialog.component';
import { ToasterService } from 'app/services/toaster.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';

@Component({
    selector: 'app-employee-list',
    templateUrl: './employee-list.component.html',
    styles: [],
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatProgressBarModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        NgIf,
        NgFor,
        DatePipe,
        MatMenuModule,
        MatDialogModule,
        MatTooltipModule,
        MatDividerModule,
        PrimeNgImportsModule
    ],
})
export class EmployeeListComponent
    extends BaseListingComponent
    implements OnDestroy {
    module_name = module_name.employee;
    dataList = [];
    total = 0;

    columns = [
        {
            key: 'employee_name',
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
            key: 'company_email',
            name: 'Email',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        },
        {
            key: 'personal_number',
            name: 'Mobile No',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        },
        {
            key: 'display_name',
            name: 'City',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
        },
        {
            key: 'office_location',
            name: 'Location',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: true,
        },
        {
            key: 'last_login_time',
            name: 'Last Login',
            is_date: true,
            date_formate: 'dd-MM-yyyy HH:mm:ss',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
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
            align: 'center',
            indicator: false,
            tooltip: true,
        },
    ];
    cols: Column[];
    _selectedColumns: Column[];
    isFilterShow: boolean = false;

    constructor(
        private employeeService: EmployeeService,
        private conformationService: FuseConfirmationService,
        private ToasterService: ToasterService,
        private matDialog: MatDialog,
        private router: Router
    ) {
        super(module_name.employee);
        // this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'employee_name';
        this.sortDirection = 'asc';
        this.Mainmodule = this;
    }

    ngOnInit() {

        this.cols = [
            { field: 'company_name', header: 'Company' },
        ];
    }

    get selectedColumns(): Column[] {
        return this._selectedColumns;
    }

    set selectedColumns(val: Column[]) {
        this._selectedColumns = this.cols.filter((col) => val.includes(col));
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        this.employeeService.getEmployeeList(this.getNewFilterReq(event)).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                // this._paginator.length = data.total;
                this.totalRecords = data.total;

            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true)
                this.isLoading = false;
            },
        });
    }

    createInternal(model): void {
        this.router.navigate([Routes.hr.employee_entry_route]);
    }

    editInternal(record): void {
        this.router.navigate([
            Routes.hr.employee_entry_route + '/' + record.id,
        ]);
    }

    viewInternal(record): void {
        this.router.navigate([
            Routes.hr.employee_entry_route + '/' + record.id + '/readonly',
        ]);
    }

    deleteInternal(record): void {
        const label: string = 'Delete Employee';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.employee_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.employeeService.delete(record.id).subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'success',
                                'Employee has been deleted!',
                                'top-right',
                                true
                            );
                            this.refreshItems();
                        },
                        error: (err) => {
                            this.alertService.showToast('error', err, 'top-right', true)
                            this.isLoading = false;
                        },
                    });
                }
            });
    }

    blockUnblock(record): void {
        if (!Security.hasPermission(employeePermissions.blockUnblockPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = record.is_blocked
            ? 'Unblock Employee'
            : 'Block Employee';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.employee_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.employeeService.setBlockUnblock(record.id).subscribe({
                        next: () => {
                            record.is_blocked = !record.is_blocked;
                            if (record.is_blocked) {
                                this.alertService.showToast(
                                    'success',
                                    'Employee has been Blocked!',
                                    'top-right',
                                    true
                                );
                            } else {
                                this.alertService.showToast(
                                    'success',
                                    'Employee has been Unblocked!',
                                    'top-right',
                                    true
                                );
                            }
                        },
                    });
                }
            });
    }

    kycCompletePending(record): void {
        if (!Security.hasPermission(employeePermissions.auditUnauditKYCPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = record.is_kyc_completed
            ? 'KYC UnAudit'
            : 'KYC Audit';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.employee_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.employeeService.setKycAudit(record.id).subscribe({
                        next: () => {
                            record.is_kyc_completed = !record.is_kyc_completed;
                            if (record.is_kyc_completed) {
                                this.alertService.showToast(
                                    'success',
                                    'KYC has been Audited!',
                                    'top-right',
                                    true
                                );
                            } else {
                                this.alertService.showToast(
                                    'success',
                                    'KYC has been UnAudited!',
                                    'top-right',
                                    true
                                );
                            }
                        },
                    });
                }
            });
    }

    setEmployeeKYCVerify(record): void {
        if (!Security.hasPermission(employeePermissions.viewKYCPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog
            .open(EmployeeKycInfoComponent, {
                data: record,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    // this.agentService.setMarkupProfile(record.id, res.transactionId).subscribe({
                    //   next: () => {
                    //     // record.is_blocked = !record.is_blocked;
                    //     this.alertService.showToast('success', "The markup profile has been set", "top-right", true);
                    //   }
                    // })
                }
            });
    }

    workingProfile(record): void {
        if (!Security.hasPermission(employeePermissions.workingStatusPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog
            .open(WorkingStatusComponent, {
                data: record,
                disableClose: true,
            })
            .afterClosed()
            .subscribe({
                next: (res) => {
                    if (res) this.refreshItems();
                },
            });
    }

    permissionProfile(record): void {
        if (!Security.hasPermission(employeePermissions.setPermissionProfilePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog
            .open(PermissionProfileDiaComponent, {
                data: record,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.employeeService
                        .mapPermissionProfile(
                            record.id,
                            res.permission_profile_id
                        )
                        .subscribe({
                            next: () => {
                                // record.is_blocked = !record.is_blocked;
                                this.alertService.showToast(
                                    'success',
                                    'Permission Profile has been Added!',
                                    'top-right',
                                    true
                                );
                                record.permission_profile_id =
                                    res.permission_profile_id;
                            },
                            error: (err) => {
                                this.alertService.showToast('error', err, 'top-right', true)
                                this.isLoading = false;
                            },
                        });
                }
            });
    }

    kycProfile(record): void {
        if (!Security.hasPermission(employeePermissions.setKYCProfilePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog
            .open(KycProfileDialogComponent, {
                data: record,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.employeeService
                        .mapkycProfile(record.id, res.kyc_profile_id)
                        .subscribe({
                            next: () => {
                                // record.is_blocked = !record.is_blocked;
                                this.alertService.showToast(
                                    'success',
                                    'KYC Profile has been Added!',
                                    'top-right',
                                    true
                                );
                                record.kyc_profile_id = res.kyc_profile_id;
                            },
                            error: (err) => {
                                this.alertService.showToast('error', err, 'top-right', true)
                                this.isLoading = false;
                            },
                        });
                }
            });
    }

    resetPassword(record): void {
        const label: string = 'Reset Password'
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.employee_name + ' ?'
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                this.employeeService.regenerateNewPassword(record.id).subscribe({
                    next: (res) => {
                        this.alertService.showToast('success', res.msg, "top-right", true);
                        this.refreshItems()
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, 'top-right', true);
                    },
                })
            }
        })
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
