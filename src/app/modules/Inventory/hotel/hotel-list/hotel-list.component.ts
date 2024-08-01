import { Router } from '@angular/router';
import { Routes } from 'app/common/const';
import { Component } from '@angular/core';
import { Security, messages, module_name } from 'app/security';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { HotelService } from 'app/services/hotel.service';
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
    selector: 'app-hotel-list',
    templateUrl: './hotel-list.component.html',
    styles: [
        `
            .tbl-grid {
                grid-template-columns: 40px 180px 130px 220px 200px 250px;
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
export class HotelListComponent extends BaseListingComponent {
    module_name = module_name.hotel;
    dataList = [];
    total = 0;

    columns = [
        {
            key: 'hotel_name',
            name: 'Hotel Name',
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
            key: 'star_category',
            name: 'Star Category',
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
        {
            key: 'email_address',
            name: 'Email Address',
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
            key: 'contact_number',
            name: 'Contact Number',
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
    ];
    cols = [];

    constructor(
        private hotelService: HotelService,
        private toastrService: ToasterService,
        private conformationService: FuseConfirmationService,
        private router: Router,
        private matDialog: MatDialog
    ) {
        super(module_name.holiday);
        this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'hotel_name';
        this.sortDirection = 'asc';
        this.Mainmodule = this;
    }

    refreshItems(): void {
        this.isLoading = true;
        this.hotelService.getHotelList(this.getFilterReq()).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                this._paginator.length = data.total;
            },
            error: (err) => {
                this.toastrService.showToast('error', err)
                this.isLoading = false;
            },
        });
    }
    createData(): void {
        if (!Security.hasNewEntryPermission(module_name.inventoryHotel)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.router.navigate([Routes.inventory.hotel_entry_route]);
    }

    editData(record): void {
        if (!Security.hasEditEntryPermission(module_name.inventoryHotel)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.router.navigate([
            Routes.inventory.hotel_entry_route + '/' + record.id,
        ]);
    }

    viewData(record): void {
        if (!Security.hasViewDetailPermission(module_name.inventoryHotel)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.router.navigate([
            Routes.inventory.hotel_entry_route + '/' + record.id + '/readonly',
        ]);
    }

    deleteData(record): void {
        if (!Security.hasDeleteEntryPermission(module_name.inventoryHotel)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Delete Hotel';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.hotel_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.hotelService.delete(record.id).subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'success',
                                'Hotel has been deleted!',
                                'top-right',
                                true
                            );
                            this.refreshItems();
                        },
                        error: (err) => {
                            this.toastrService.showToast('error', err)
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
