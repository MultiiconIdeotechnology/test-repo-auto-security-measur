import { Router } from '@angular/router';
import { DestinationService } from './../../../../services/destination.service';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Security, destinationPermissions, filter_module_name, messages, module_name } from 'app/security';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { DestinationEntryComponent } from '../destination-entry/destination-entry.component';
import { DestinationCitiesComponent } from '../destination-cities/destination-cities.component';
import { CitiesListDialogComponent } from '../cities-list-dialog/cities-list-dialog.component';
import { ExclusionListDialogComponent } from '../exclusion-list-dialog/exclusion-list-dialog.component';
import { DefaultExclusionsComponent } from '../default-exclusions/default-exclusions.component';
import { ImagesComponent } from '../images/images.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
    selector: 'app-destination-list',
    templateUrl: './destination-list.component.html',
    styles: [`
    .tbl-grid {
      grid-template-columns:  40px 240px 120px 140px 120px;
    }
    `],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatTableModule,
        MatSortModule,
        MatInputModule,
        MatButtonModule,
        MatTooltipModule,
        MatDividerModule,
        PrimeNgImportsModule
    ],
})
export class DestinationListComponent extends BaseListingComponent {
    module_name = module_name.destination;
    filter_table_name = filter_module_name.destination_master;
    private settingsUpdatedSubscription: Subscription;
    dataList = [];
    isFilterShow: boolean = false;

    columns = [
        {
            key: 'destination_name',
            name: 'Destination Name',
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
        // { key: 'exclusions', name: 'Exclusions', is_date: false, date_formate: '', is_sortable: false, class: '', is_sticky: false, align: '', indicator: false, is_boolean:false, tooltip: true },
        {
            key: 'cities_length',
            name: 'Cities',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            is_boolean: true,
            tooltip: true
        },
        {
            key: 'exclusion_length',
            name: 'Exclusions',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            is_boolean: true,
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
            tooltip: true
        },
    ];
    cols = [];

    constructor(
        private destinationService: DestinationService,
        private conformationService: FuseConfirmationService,
        private router: Router,
        private matDialog: MatDialog,
        public _filterService: CommonFilterService
    ) {
        super(module_name.destination);
        this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'destination_name';
        this.sortDirection = 'asc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    ngOnInit(): void {
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShow = true;
            this.primengTable._filter();
        });
    }

    ngAfterViewInit(){
        // Defult Active filter show
        if(this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShow = true;
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            this.primengTable['filters'] = filterData['table_config'];
        }
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        this.destinationService
            .getdestinationList(this.getNewFilterReq(event))
            .subscribe({
                next: (data) => {
                    this.isLoading = false;
                    this.dataList = data.data;
                    this.totalRecords = data.total;

                    this.dataList.forEach((row) => {
                        row['cities_length'] = row['cities'].length;
                    });

                    this.dataList.forEach((row) => {
                        row['exclusion_length'] = row['exclusion'].length;
                    });
                },
                error: (err) => {
                    this.alertService.showToast('error', err, 'top-right', true)
                    this.isLoading = false;
                },
            });
    }

    createInternal(model): void {
        this.matDialog
            .open(DestinationEntryComponent, {
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

    destinationCities(record): void {
        if (!Security.hasPermission(destinationPermissions.destinationCitiesPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }
        this.matDialog
            .open(DestinationCitiesComponent, {
                data: { data: record, id: record.id },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) record.cities_length = res;
            });
    }

    defaultExclusions(record): void {
        if (!Security.hasPermission(destinationPermissions.defaultExclusionsPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog
            .open(DefaultExclusionsComponent, {
                data: record,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) record.exclusion_length = res;
            });
    }

    images(record): void {
        if (!Security.hasPermission(destinationPermissions.addImagePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog
            .open(ImagesComponent, {
                data: { data: record, name: 'Destination' },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                // this.refreshItems();
            });
    }

    editInternal(record): void {
        this.matDialog
            .open(DestinationEntryComponent, {
                data: record,
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

    deleteInternal(record): void {
        const label: string = 'Delete Destination';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.destination_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.destinationService.delete(record.id).subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'success',
                                'Destination has been deleted!',
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

    EnableDisable(record): void {

        if (!Security.hasPermission(destinationPermissions.enableDisablePermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = record.is_enable
            ? 'Disable Destination'
            : 'Enable Destination';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.destination_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.destinationService
                        .setEnableDisable(record.id)
                        .subscribe({
                            next: () => {
                                record.is_enable = !record.is_enable;
                                if (record.is_enable) {
                                    this.alertService.showToast(
                                        'success',
                                        'Destination has been Enabled!',
                                        'top-right',
                                        true
                                    );
                                } else {
                                    this.alertService.showToast(
                                        'success',
                                        'Destination has been Disabled!',
                                        'top-right',
                                        true
                                    );
                                }
                            },
                            error: (err) => {
                                this.alertService.showToast('error', err);
                            }
                        });
                }
            });
    }

    opanCitiesListDialog(rowData: any) {
        const assignedToList = rowData['cities'];
        if (assignedToList.length <= 0) return;
        this.matDialog.open(CitiesListDialogComponent, {
            disableClose: true,
            data: assignedToList,
        });
    }

    opanExclusionListDialog(rowData: any) {
        const assignedToList = rowData['exclusion'];
        if (assignedToList.length <= 0) return;
        this.matDialog.open(ExclusionListDialogComponent, {
            disableClose: true,
            data: assignedToList,
        });
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    ngOnDestroy(): void {
        // this.masterService.setData(this.key, this);

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }
}
