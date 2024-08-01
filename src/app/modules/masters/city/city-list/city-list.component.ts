import { Routes } from 'app/common/const';
import { Router } from '@angular/router';
import { Security, cityPermissions, messages, module_name } from 'app/security';
import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { CityService } from 'app/services/city.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { CitysEntryComponent } from '../citys-entry/citys-entry.component';
import { ImagesComponent } from '../../destination/images/images.component';
import { UserService } from 'app/core/user/user.service';
import { takeUntil } from 'rxjs';
import { SetPasswordComponent } from 'app/layout/common/user/set-password/set-password.component';

@Component({
    selector: 'app-city-list',
    templateUrl: './city-list.component.html',
    styles: [
        `
            .tbl-grid {
                grid-template-columns: 40px 170px 280px 120px 450px 210px;
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
export class CityListComponent
    extends BaseListingComponent
    implements OnDestroy {
    module_name = module_name.city;
    dataList = [];
    total = 0;
    user: any;
    is_first: any;

    columns = [
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
            tooltip: true,
        },
        {
            key: 'state_name',
            name: 'State',
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
            key: 'country',
            name: 'Country',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
        },
        {
            key: 'display_name',
            name: 'Display Name',
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
            key: 'gst_state_code',
            name: 'GST State Code',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false,
        },
    ];
    cols = [];

    constructor(
        private cityService: CityService,
        private conformationService: FuseConfirmationService,
        private router: Router,
        private matDialog: MatDialog,
        private _userService: UserService
    ) {
        super(module_name.city);
        this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'country';
        this.sortDirection = 'asc';
        this.Mainmodule = this;

     
    }

    refreshItems(): void {
        this.isLoading = true;
        this.cityService.getCityList(this.getFilterReq()).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                this._paginator.length = data.total;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }

    createInternal(model): void {
        // this.router.navigate([Routes.masters.city_entry_route]);
        this.matDialog.open(CitysEntryComponent,
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
            .open(CitysEntryComponent, {
                data: { data: record, readonly: false },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.refreshItems();
                }
            });
    }

    viewInternal(record): void {
        this.matDialog.open(CitysEntryComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    deleteInternal(record): void {
        const label: string = 'Delete City';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.display_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.cityService.delete(record.id).subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'success',
                                'City has been deleted!',
                                'top-right',
                                true
                            );
                            this.refreshItems();
                        },
                        error: (err) => {
                            this.alertService.showToast(
                                'error',
                                err,
                                'top-right',
                                true
                            );
                        },

                    });
                }
            });
    }

    EnableDisable(record): void {
        if (!Security.hasPermission(cityPermissions.enablePreferedHotelPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = record.is_prefered_hotel
            ? 'Disable Preferred Hotel'
            : 'Enable Preferred Hotel';
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ?',
        })
            .afterClosed().subscribe((res) => {
                if (res === 'confirmed') {
                    this.cityService.setPreferedHotelEnable(record.id).subscribe({
                        next: () => {
                            record.is_prefered_hotel = !record.is_prefered_hotel;
                            if (record.is_prefered_hotel) {
                                this.alertService.showToast(
                                    'success',
                                    'Preferred Hotel has been Enabled!',
                                    'top-right',
                                    true
                                );
                                this.refreshItems();
                            } else {
                                this.alertService.showToast(
                                    'success',
                                    'Preferred Hotel has been Disabled!',
                                    'top-right',
                                    true
                                );
                                this.refreshItems();
                            }
                        },
                        error: (err) => {
                            this.alertService.showToast(
                                'error',
                                err,
                                'top-right',
                                true
                            );
                        },
                    });
                }
            });
    }

    images(record): void {
        if (!Security.hasPermission(cityPermissions.addImagePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog
            .open(ImagesComponent, {
                data: { data: record, name: 'City' },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                // this.refreshItems();
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
