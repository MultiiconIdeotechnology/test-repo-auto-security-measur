import { Router } from '@angular/router';
import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { ReactiveFormsModule } from '@angular/forms';
import { Security, messages, module_name, vehiclePermissions } from 'app/security';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { VehicleService } from 'app/services/vehicle.service';
import { VehicleEntryComponent } from '../vehicle-entry/vehicle-entry.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ImagesComponent } from 'app/modules/masters/destination/images/images.component';
import { ToasterService } from 'app/services/toaster.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';

@Component({
    selector: 'app-vehicle-list',
    templateUrl: './vehicle-list.component.html',
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
        MatMenuModule,
        MatDialogModule,
        MatTooltipModule,
        MatDividerModule,
        PrimeNgImportsModule
    ],
})
export class VehicleListComponent extends BaseListingComponent {
    module_name = module_name.vehicle;
    dataList = [];
    total = 0;
    cols = [];
    isFilterShow: boolean = false;

    columns = [
        {
            key: 'vehicle_name',
            name: 'Vehicle Name',
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
            key: 'vehicle_type',
            name: 'Vehicle Type',
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
            key: 'short_description',
            name: 'Short Description',
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
            key: 'special_notes',
            name: 'Special Notes',
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
            key: 'is_ac_vehicle',
            name: 'Is Ac Vehicle',
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
            key: 'with_baggage_capacity',
            name: 'With Baggage Capacity',
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
        {
            key: 'without_baggage_capacity',
            name: 'Without Baggage Capacity',
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
    
    selectedAction:string;
    actionList: any[] = [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
    ]


    constructor(
        private vehicleService: VehicleService,
        private toasterService: ToasterService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        private router: Router
    ) {
        super(module_name.vehicle);
        // this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'vehicle_name';
        this.sortDirection = 'asc';
        this.Mainmodule = this;
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        this.vehicleService.getVehicleList(this.getNewFilterReq(event)).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                // this._paginator.length = data.total;
                this.totalRecords = data.total;

            },
            error: (err) => {
                this.toasterService.showToast('error',err)
                this.isLoading = false;
            },
        });
    }

    createInternal(model): void {
        this.matDialog
            .open(VehicleEntryComponent, {
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

    editInternal(record): void {
        this.matDialog
            .open(VehicleEntryComponent, {
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
        this.matDialog.open(VehicleEntryComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    deleteInternal(record): void {
        const label: string = 'Delete Vehicle Product';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.vehicle_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.vehicleService.delete(record.id).subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'success',
                                'Vehicle has been deleted!',
                                'top-right',
                                true
                            );
                            this.refreshItems();
                        },
                        error: (err) => {
                            this.toasterService.showToast('error',err)
                            this.isLoading = false;
                        },

                    });
                }
            });
    }

    AuditUnaudit(record): void {
        if (!Security.hasPermission(vehiclePermissions.auditUnauditPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = record.is_audited
            ? 'Unaudit Vehicle'
            : 'Audit Vehicle';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.vehicle_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.vehicleService.setAuditUnaudit(record.id).subscribe({
                        next: () => {
                            record.is_audited = !record.is_audited;
                            if (record.is_audited) {
                                this.alertService.showToast(
                                    'success',
                                    'Vehicle has been Audited!',
                                    'top-right',
                                    true
                                );
                            } else {
                                this.alertService.showToast(
                                    'success',
                                    'Vehicle has been Unaudited!',
                                    'top-right',
                                    true
                                );
                            }
                        },
                        error: (err) => {
                            this.toasterService.showToast('error',err)
                            this.isLoading = false;
                        },
                    });
                }
            });
    }

    EnableDisable(record): void {
        if (!Security.hasPermission(vehiclePermissions.enableDisablePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = record.is_disabled
            ? 'Enable Vehicle'
            : 'Disable Vehicle';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.vehicle_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.vehicleService.setEnableDisable(record.id).subscribe({
                        next: () => {
                            record.is_disabled = !record.is_disabled;
                            if (record.is_disabled) {
                                this.alertService.showToast(
                                    'success',
                                    'Vehicle has been Disabled!',
                                    'top-right',
                                    true
                                );
                            } else {
                                this.alertService.showToast(
                                    'success',
                                    'Vehicle has been Enable!',
                                    'top-right',
                                    true
                                );
                            }
                        },
                        error: (err) => {
                            this.toasterService.showToast('error',err)
                            this.isLoading = false;
                        },
                    });
                }
            });
    }

    addImage(model): void {
        if (!Security.hasPermission(vehiclePermissions.addImagePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog
        .open(ImagesComponent, {
            data: {data: model, name : 'Vehicle'},
            disableClose: true,
        })
        .afterClosed()
        .subscribe((res) => {
                // this.refreshItems();
        });
        // const Id = model['id'];
        // this.matDialog
        //     .open(VehicleImageComponent, {
        //         data: { model, Id },
        //         disableClose: true,
        //     })
        //     .afterClosed()
        //     .subscribe((res) => {
        //         if (res) {
        //             this.alertService.showToast(
        //                 'success',
        //                 'Image has been Added!',
        //                 'top-right',
        //                 true
        //             );
        //             this.refreshItems();
        //         }
        //     });
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
