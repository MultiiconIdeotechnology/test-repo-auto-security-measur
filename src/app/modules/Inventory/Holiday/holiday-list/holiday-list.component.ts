import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { Routes } from 'app/common/const';
import { Security, filter_module_name, inventoryHolidayPermissions, messages, module_name } from 'app/security';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HolidayService } from 'app/services/holiday.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ProductEntryComponent } from '../product-entry/product-entry.component';
import { Linq } from 'app/utils/linq';
import { DateTime } from 'luxon';
import { ToasterService } from 'app/services/toaster.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { FlightTabService } from 'app/services/flight-tab.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-holiday-list',
    templateUrl: './holiday-list.component.html',
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
export class HolidayListComponent extends BaseListingComponent {
    module_name = module_name.holiday;
    // Variable
    filter_table_name = filter_module_name.holiday_products;
    private settingsUpdatedSubscription: Subscription;

    dataList = [];
    total = 0;
    isFilterShow: boolean = false;
    supplierListAll: any[] = [];
    selectedSupplier: any;

    ngOnInit() {
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            if(resp['table_config']['supplier_name']){
                this.selectedSupplier = resp['table_config'].supplier_name?.value;
            }
            if (resp['table_config']['publish_date_time'].value) {
                resp['table_config']['publish_date_time'].value = new Date(resp['table_config']['publish_date_time'].value);
            }
            if (resp['table_config']['entry_date_time'].value) {
                resp['table_config']['entry_date_time'].value = new Date(resp['table_config']['entry_date_time'].value);
            }
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShow = true;
            this.primengTable._filter();
        });
        this.getSupplier();
    }

    columns = [
        {
            key: 'product_name',
            name: 'Product',
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
            key: 'destination_name',
            name: 'Destination',
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
            key: 'supplier_name',
            name: 'Supplier',
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
            key: 'no_of_nights',
            name: 'Nights',
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
            key: 'no_of_days',
            name: 'Days',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '    ',
            is_sticky: false,
            align: 'center',
            indicator: false,
            is_required: false,
            is_included: false,
            is_boolean: false,
            tooltip: true,
        },
        {
            key: 'is_popular',
            name: 'Is Popular',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: 'text-center',
            is_sticky: false,
            align: 'center',
            indicator: false,
            is_required: false,
            is_included: false,
            is_boolean: true,
            tooltip: true,
        },
        {
            key: 'publish_date_time',
            name: 'Published',
            is_date: true,
            date_formate: 'dd-MM-yyyy HH:mm',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            is_required: false,
            is_included: false,
            is_boolean: false,
            tooltip: false,
        },
        {
            key: 'entry_date_time',
            name: 'Entry',
            is_date: true,
            date_formate: 'dd-MM-yyyy HH:mm',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            is_required: false,
            is_included: false,
            is_boolean: false,
            tooltip: false,
        },
    ];

    actionList: any[] = [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
    ]

    getSupplier() {
        this.flighttabService.getSupplierBoCombo('holiday').subscribe((data: any) => {
            this.supplierListAll = data;

            for (let i in this.supplierListAll) {
                this.supplierListAll[i].id_by_value = this.supplierListAll[i].company_name
            }
        })
    }

    constructor(
        private holidayService: HolidayService,
        private toasterService: ToasterService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        private flighttabService: FlightTabService,
        private router: Router,
        public _filterService: CommonFilterService
    ) {
        super(module_name.holiday);
        // this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'entry_date_time';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this._filterService.applyDefaultFilter(this.filter_table_name);
    }

    refreshItems(event?: any): void {
        this.isLoading = true;
        this.holidayService
            .getHolidayProductList(this.getNewFilterReq(event))
            .subscribe({
                next: (data) => {
                    this.isLoading = false;
                    this.dataList = data.data;
                    this.totalRecords = data.total;
                    // this._paginator.length = data.total;
                },
                error: (err) => {
                    this.toasterService.showToast('error', err)
                    this.isLoading = false;
                },
            });
    }

    ngAfterViewInit(){
        // Defult Active filter show
        if(this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShow = true;
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            if(filterData['table_config']['supplier_name']){
                this.selectedSupplier = filterData['table_config'].supplier_name?.value;
            }
            if (filterData['table_config']['publish_date_time'].value) {
                filterData['table_config']['publish_date_time'].value = new Date(filterData['table_config']['publish_date_time'].value);
            }
            if (filterData['table_config']['entry_date_time'].value) {
                filterData['table_config']['entry_date_time'].value = new Date(filterData['table_config']['entry_date_time'].value);
            }
            this.primengTable['filters'] = filterData['table_config'];
        }
      }

    createData(): void {
        if (!Security.hasNewEntryPermission(module_name.inventoryHoliday)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(ProductEntryComponent, {
            disableClose: true,
            data: { id: '' }
        }).afterClosed().subscribe(res => {
            if (res)
                this.refreshItems();
        });
    }

    editData(record): void {
        if (!Security.hasEditEntryPermission(module_name.inventoryHoliday)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(ProductEntryComponent, {
            disableClose: true,
            data: record
        }).afterClosed().subscribe(res => {
            if (res)
                this.refreshItems();
        });
    }

    viewData(record): void {
        if (!Security.hasViewDetailPermission(module_name.inventoryHoliday)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.router.navigate([Routes.inventory.holiday_entry_route + '/' + record.id + '/readonly']);
    }

    deleteData(record): void {
        if (!Security.hasDeleteEntryPermission(module_name.inventoryHoliday)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Delete Holiday Product';
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
                    this.holidayService.delete(record.id).subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'success',
                                'Holiday has been deleted!',
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

    HolidayPublish(record): void {
        if (!Security.hasPermission(inventoryHolidayPermissions.publishUnpublishPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = record.is_published
            ? 'Unpublish Holiday Product'
            : 'Publish Holiday Product';
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
                    this.holidayService.setHolidayPublish(record.id).subscribe({
                        next: () => {
                            record.is_published = !record.is_published;
                            if (record.is_published) {
                                this.alertService.showToast('success', "Holiday Product has been Publish!", "top-right", true);
                            } else {
                                this.alertService.showToast('success', "Holiday Product has been UnPublish!", "top-right", true);
                            }
                        }, error: (err) => {
                            this.alertService.showToast("error", err)
                        }
                    });
                }
            });
    }

    HolidayPopular(record): void {
        if (!Security.hasPermission(inventoryHolidayPermissions.setasPopularPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = record.is_popular
            ? 'Not Popular Holiday Product'
            : 'Popular Holiday Product';
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
                    this.holidayService.setHolidayPopular(record.id).subscribe({
                        next: () => {
                            record.is_popular = !record.is_popular;
                            if (record.is_popular) {
                                this.alertService.showToast('success', "Holiday Product has been Popular!", "top-right", true);
                            } else {
                                this.alertService.showToast('success', "Holiday Product has been Not Popular!", "top-right", true);
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

    copy(record): void {
        if (!Security.hasPermission(inventoryHolidayPermissions.copyProductPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.conformationService.open({
            title: 'Copy Product',
            message: 'Are you sure to generate copy of ' + record.product_name + ' ?',
        }).afterClosed().subscribe((res) => {
            if (res === 'confirmed') {
                this.holidayService.CopyProduct(record.id).subscribe({
                    next: () => {
                        this.alertService.showToast('success', 'Product Copied');
                        this.refreshItems();
                    }, error: (err) => {
                        this.alertService.showToast('error', err);
                    }
                })
            }
        });
    }

    viewDetails(record: any): void {
        if (!Security.hasPermission(inventoryHolidayPermissions.viewHolidayPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // const oldJSONn = JSON.parse(
        //     localStorage.getItem('holiday-filters') || '{}'
        // );
        const queryParams = {
            id: record.id,
            date: DateTime.fromISO(record.departure_date).toFormat(
                'yyyy-MM-dd'),
            adult: 2,
            child: 0,
        };
        Linq.recirect('/inventory/holiday-products/view-details', queryParams);

    }



    getNodataText(): string {
        if (this.isLoading) return 'Loading...';
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
