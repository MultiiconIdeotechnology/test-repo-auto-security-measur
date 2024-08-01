import { Component } from '@angular/core';
import { Security, messages, module_name, takeransfersPermissions } from 'app/security';
import { Router } from '@angular/router';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { ReactiveFormsModule } from '@angular/forms';
import { TransferEntryComponent } from '../transfer-entry/transfer-entry.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TransferService } from 'app/services/transfer.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ToasterService } from 'app/services/toaster.service';

@Component({
    selector: 'app-transfer-list',
    templateUrl: './transfer-list.component.html',
    styles: [
        `.tbl-grid {
                grid-template-columns: 40px 150px 150px 300px 140px 130px 150px 200px 200px;
            }
        `,
    ],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
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
    ],
})
export class TransferListComponent extends BaseListingComponent {
    module_name = module_name.transfer;
    dataList = [];
    total = 0;

    columns = [
        {
            key: 'transfer_from',
            name: 'Transfer From',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: true,
            is_required: false,
            is_included: false,
            is_boolean: false,
            tooltip: true,
        },
        {
            key: 'transfer_to',
            name: 'Transfer To',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            is_required: false,
            is_included: false,
            is_boolean: false,
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
            is_boolean: false,
            tooltip: true,
        },
        {
            key: 'transfer_type',
            name: 'Transfer Type',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            is_required: false,
            is_included: false,
            is_boolean: false,
            tooltip: true,
        },
        {
            key: 'is_airport_pickup',
            name: 'Airport Pickup',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            is_required: false,
            is_included: false,
            is_boolean: true,
            tooltip: true,
        },
        {
            key: 'is_airport_dropoff',
            name: 'Airport Dropoff',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            is_required: false,
            is_included: false,
            is_boolean: true,
            tooltip: true,
        },
        {
            key: 'is_inter_hotel_transfer',
            name: 'Inter Hotel Transfer',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            is_required: false,
            is_included: false,
            is_boolean: true,
            tooltip: true,
        },
        {
            key: 'distance_in_km',
            name: 'Distance in km',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            is_required: false,
            is_included: false,
            is_boolean: false,
            tooltip: true,
        },
    ];
    cols = [];

    constructor(
        private transferService: TransferService,
        private toasterService: ToasterService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        private router: Router
    ) {
        super(module_name.transfer);
        this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'city_name';
        this.sortDirection = 'asc';
        this.Mainmodule = this;
    }

    refreshItems(): void {
        this.isLoading = true;
        this.transferService
            .getTransferActivityList(this.getFilterReq())
            .subscribe({
                next: (data) => {
                    this.isLoading = false;
                    this.dataList = data.data;
                    this._paginator.length = data.total;
                },
                error: (err) => {
                    this.toasterService.showToast('error', err)
                    this.isLoading = false;
                },
            });
    }

    createInternal(model): void {
        this.matDialog.open(TransferEntryComponent, {
                data: null,
                disableClose: true,
            })
            .afterClosed().subscribe((res) => {
                if (res) {
                    this.alertService.showToast('success','New record added','top-right',true);
                    this.refreshItems();
                }
            });
    }

    editInternal(record): void {
        this.matDialog.open(TransferEntryComponent, {
                data: { data: record, readonly: false },
                disableClose: true,
            })
            .afterClosed().subscribe((res) => {
                if (res) {
                    this.alertService.showToast('success','Record modified','top-right',true);
                    this.refreshItems();
                }
            });
    }

    viewInternal(record): void {
        this.matDialog.open(TransferEntryComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    deleteInternal(record): void {
        const label: string = 'Delete Transfer';
        this.conformationService.open({
                title: label,
                message:'Are you sure to ' + label.toLowerCase() + ' ' + record.city_name + ' ?',
            })
            .afterClosed().subscribe((res) => {
                if (res === 'confirmed') {
                    this.transferService.delete(record.id).subscribe({
                        next: () => {
                            this.alertService.showToast('success','Transfer has been deleted!','top-right',true);
                            this.refreshItems();
                        },
                        error: (err) => {
                            this.toasterService.showToast('error', err)
                            this.isLoading = false;
                        },
                    });
                }
            });
    }

    AuditUnaudit(record): void {
        if (!Security.hasPermission(takeransfersPermissions.auditUnauditPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = record.is_audited ? 'Unaudit Transfer' : 'Audit Transfer';
        this.conformationService.open({
                title: label,
                message:'Are you sure to ' + label.toLowerCase() + ' ' + record.city_name + ' ?',
            })
            .afterClosed().subscribe((res) => {
                if (res === 'confirmed') {
                    this.transferService.setAuditUnaudit(record.id).subscribe({
                        next: () => {
                            record.is_audited = !record.is_audited;
                            if (record.is_audited) {
                                this.alertService.showToast('success','Transfer has been Audited!','top-right',true);
                            } else {
                                this.alertService.showToast('success','Transfer has been Unaudited!','top-right',true);
                            }
                        },
                        error: (err) => {
                            this.toasterService.showToast('error', err)
                            this.isLoading = false;
                        },
                    });
                }
            });
    }

    EnableDisable(record): void {
        if (!Security.hasPermission(takeransfersPermissions.enableDisablePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = record.is_disabled ? 'Enable Transfer' : 'Disable Transfer';
        this.conformationService.open({
                title: label,
                message:'Are you sure to ' + label.toLowerCase() + ' ' + record.city_name + ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.transferService.setEnableDisable(record.id).subscribe({
                        next: () => {
                            record.is_disabled = !record.is_disabled;
                            if (record.is_disabled) {
                                this.alertService.showToast('success','Transfer has been Disabled!','top-right',true);
                            } else {
                                this.alertService.showToast('success','Transfer has been Enable!','top-right',true);
                            }
                        },
                        error: (err) => {
                            this.toasterService.showToast('error', err)
                            this.isLoading = false;
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
        this.masterService.setData(this.key, this);
    }
}
