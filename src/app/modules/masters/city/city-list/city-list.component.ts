import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Security, cityPermissions, messages, module_name, filter_module_name } from 'app/security';
import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { CityService } from 'app/services/city.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { CitysEntryComponent } from '../citys-entry/citys-entry.component';
import { ImagesComponent } from '../../destination/images/images.component';
import { UserService } from 'app/core/user/user.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { CommonFilterComponent } from 'app/modules/settings/common-filter/common-filter.component';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'app-city-list',
    templateUrl: './city-list.component.html',
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
        MatDividerModule,
        FormsModule,
        MatTooltipModule,
        PrimeNgImportsModule,
        CommonFilterComponent
    ],
})
export class CityListComponent extends BaseListingComponent implements OnDestroy {
    module_name = module_name.city;
    filter_table_name = filter_module_name.city_master;
    dataList = [];
    total = 0;
    user: any;
    is_first: any;
    cols: Column[] = [
        { field: 'gst_state_code', header: 'GST State Code' },
        { field: 'country_code', header: 'Country Code' },
        { field: 'mobile_code', header: 'Mobile Code' },
    ];
    _selectedColumns: Column[];
    isFilterShow: boolean = false;
    private settingsUpdatedSubscription: Subscription;

    constructor(
        private cityService: CityService,
        private conformationService: FuseConfirmationService,
        private router: Router,
        private matDialog: MatDialog,
        public _userService: UserService,
        public _filterService: CommonFilterService
    ) {
        super(module_name.city);
        this.key = this.module_name;
        this.sortColumn = 'country';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit() {
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            this.isFilterShow = true;
            this.primengTable['filters'] = resp['table_config'];
            this._selectedColumns = resp['selectedColumns'] || [];
            this.primengTable._filter();
        });
    }

    ngAfterViewInit() {
        // Defult Active filter show
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShow = true;
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            this.primengTable['filters'] = filterData['table_config'];
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
            this._selectedColumns = filterData['selectedColumns'] || [];
        }
    }

    get selectedColumns(): Column[] {
        return this._selectedColumns;
    }

    set selectedColumns(val: Column[]) {
        if (Array.isArray(val)) {
            this._selectedColumns = this.cols.filter(col =>
                val.some(selectedCol => selectedCol.field === col.field)
            );
        } else {
            this._selectedColumns = [];
        }
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        this.cityService.getCityList(this.getNewFilterReq(event)).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data.data;
                this.totalRecords = data.total;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }

    createInternal(model: any): void {
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

    editInternal(record: any): void {
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


    viewInternal(record: any): void {
        this.matDialog.open(CitysEntryComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    deleteInternal(record: any): void {
        const label: string = 'Delete City';
        this.conformationService
            .open({
                title: label,
                message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.display_name + ' ?',
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

    EnableDisable(record: any): void {
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

    images(record: any): void {
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

    ngOnDestroy() {
        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }
}
