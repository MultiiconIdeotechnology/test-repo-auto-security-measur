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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { Security, inventoryVisaPermissions, messages, module_name } from 'app/security';
import { VisaService } from 'app/services/visa.service';
import { VisaEntryComponent } from '../visa-entry/visa-entry.component';
import { VisaDocumentComponent } from '../visa-document/visa-document.component';
import { VisaChargesComponent } from '../visa-charges/visa-charges.component';
import { ToasterService } from 'app/services/toaster.service';
import { VisaSpecialNotesComponent } from '../visa-special-notes/visa-special-notes.component';

@Component({
    selector: 'app-visa-list',
    templateUrl: './visa-list.component.html',
    styleUrls: ['./visa-list.component.scss'],
    styles: [
        `
            .tbl-grid {
                grid-template-columns: 40px 200px 200px 119px 100px 130px 140px 110px;
            }
        `,
    ],
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
    ],
})
export class VisaListComponent extends BaseListingComponent {
    module_name = module_name.visa;
    dataList = [];
    total = 0;

    columns = [
        {
            key: 'destination_caption',
            name: 'Destination',
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
            key: 'country',
            name: 'Country',
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
            key: 'visa_type',
            name: 'Visa Type',
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
            key: 'validity_period',
            name: 'Validity',
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
            applied: true,
        },
        {
            key: 'length_of_stay',
            name: 'Length of Stay',
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
            applied: true,
        },
        {
            key: 'processing_time',
            name: 'Processing Time',
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
            applied: true,
        },
        {
            key: 'no_of_entry',
            name: 'No of Entry',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: 'header-center-view',
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
        private visaService: VisaService,
        private toasterService: ToasterService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog
    ) {
        super(module_name.visa);
        this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'destination_caption';
        this.sortDirection = 'asc';
        this.Mainmodule = this;
    }

    refreshItems(): void {
        this.isLoading = true;
        this.visaService.getVisaList(this.getFilterReq()).subscribe({
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

    createData(): void {
        if (!Security.hasNewEntryPermission(module_name.inventoryVisa)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        
        this.matDialog
            .open(VisaEntryComponent, {
                data: null,
                disableClose: true,
            })
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

    viewData(record): void {
        if (!Security.hasViewDetailPermission(module_name.inventoryVisa)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(VisaEntryComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    editData(record): void {
        if (!Security.hasEditEntryPermission(module_name.inventoryVisa)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog
            .open(VisaEntryComponent, {
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

    deleteData(record): void {
        if (!Security.hasDeleteEntryPermission(module_name.inventoryVisa)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Delete Visa';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.destination_caption +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.visaService.delete(record.id).subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'success',
                                'Visa has been deleted!',
                                'top-right',
                                true
                            );
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

    EnableDisable(record): void {
        if (!Security.hasPermission(inventoryVisaPermissions.enableDisablePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = record.is_enable ? 'Disable' : 'Enable';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.destination_caption +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.visaService
                        .enableDisableVisaDestination(record.id)
                        .subscribe({
                            next: () => {
                                record.is_enable = !record.is_enable;
                                if (record.is_enable) {
                                    this.alertService.showToast(
                                        'success',
                                        'Visa Destination has been Enabled!',
                                        'top-right',
                                        true
                                    );
                                } else {
                                    this.alertService.showToast(
                                        'success',
                                        'Visa Destination has been Disabled!',
                                        'top-right',
                                        true
                                    );
                                }
                            }, error: (err) => {
                                this.alertService.showToast('error', err);
                            }
                        });
                }
            });
    }

    document(data): void {
        if (!Security.hasPermission(inventoryVisaPermissions.visaDocumentsPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(VisaDocumentComponent, {
            data: { data: data },
            disableClose: true,
        });
    }

    charges(data): void {
        if (!Security.hasPermission(inventoryVisaPermissions.visaChargesPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(VisaChargesComponent, {
            data: { data: data },
            disableClose: true,
        });
    }

    specialNotes(data): void {
        if (!Security.hasPermission(inventoryVisaPermissions.specialNotesPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(VisaSpecialNotesComponent, {
            data: data,
            disableClose: true,
        })
        .afterClosed().subscribe((res) => {
            if (res) {
                this.refreshItems();
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
