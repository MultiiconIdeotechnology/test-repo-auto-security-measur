import { NavigationExtras, Router } from '@angular/router';
import { Component } from '@angular/core';
import { Routes } from 'app/common/const';
import { Security, filter_module_name, inventoryHolidayPermissions, messages, module_name } from 'app/security';
import { BaseListingComponent, Column, Types } from 'app/form-models/base-listing';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
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
import { Linq } from 'app/utils/linq';
import { DateTime } from 'luxon';
import { ToasterService } from 'app/services/toaster.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { FlightTabService } from 'app/services/flight-tab.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { Subscription } from 'rxjs';
import { HolidayVersionTwoService } from 'app/services/holidayversion2.service ';
import { cloneDeep } from 'lodash';

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
    module_name = module_name.holidayV2;
    // Variable
    filter_table_name = filter_module_name.holiday_products;
    private settingsUpdatedSubscription: Subscription;

    dataList = [];
    total = 0;
    isFilterShow: boolean = false;
    supplierListAll: any[] = [];
    selectedSupplier: any;

    types = Types;
    cols: Column[] = [];
    selectedColumns: Column[] = [];
    exportCol: Column[] = [];
    activeFiltData: any = {};

    constructor(
        private holidayService: HolidayVersionTwoService,
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

        this.selectedColumns = [
            { field: 'product_name', header: 'Product', type: Types.text, isFrozen: false },
            { field: 'destination', header: 'Destination', type: Types.text },
            { field: 'supplier_name', header: 'Supplier', type: Types.select },
            { field: 'no_of_nights', header: 'Nights', type: Types.number, fixVal: 0 },
            { field: 'no_of_days', header: 'Days', type: Types.number, fixVal: 0 },
            { field: 'is_popular', header: 'Is Popular', type: Types.boolean , class:'text-center' },
            { field: 'is_audited', header: 'Is Audited', type: Types.boolean , class:'text-center' },
            { field: 'publish_date_time', header: 'Published', type: Types.date, dateFormat: 'dd-MM-yyyy HH:mm:ss' },
            { field: 'entry_date_time', header: 'Entry', type: Types.date, dateFormat: 'dd-MM-yyyy HH:mm:ss' },
            { field: 'last_price_date', header: 'Last Price Date', type: Types.date, dateFormat: 'dd-MM-yyyy HH:mm:ss' }
        ];
        this.cols.unshift(...this.selectedColumns);
        this.exportCol = cloneDeep(this.cols);
    }

    ngOnInit() {
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['supplier_name']) {
                this.selectedSupplier = resp['table_config'].supplier_name?.value;
            }
            if (resp['table_config']['publish_date_time'].value) {
                resp['table_config']['publish_date_time'].value = new Date(resp['table_config']['publish_date_time'].value);
            }
            if (resp['table_config']['entry_date_time'].value) {
                resp['table_config']['entry_date_time'].value = new Date(resp['table_config']['entry_date_time'].value);
            }
            if (resp['table_config']['last_price_date'].value) {
                resp['table_config']['last_price_date'].value = new Date(resp['table_config']['last_price_date'].value);
            }
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShow = true;
            this.selectedColumns = this.checkSelectedColumn(resp['selectedColumns'] || [], this.selectedColumns);
            this.primengTable._filter();
        });
        this.getSupplier("")
    }


    actionList: any[] = [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
    ]

    getSupplier(value) {
        this.flighttabService.getSupplierBoCombo(value).subscribe((data: any) => {
            this.supplierListAll = data;

            for (let i in this.supplierListAll) {
                this.supplierListAll[i].id_by_value = this.supplierListAll[i].company_name
            }
        })
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

    ngAfterViewInit() {
        // Defult Active filter show
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShow = true;
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            if (filterData['table_config']['supplier_name']) {
                this.selectedSupplier = filterData['table_config'].supplier_name?.value;
            }
            if (filterData['table_config']['publish_date_time'].value) {
                filterData['table_config']['publish_date_time'].value = new Date(filterData['table_config']['publish_date_time'].value);
            }
            if (filterData['table_config']['entry_date_time'].value) {
                filterData['table_config']['entry_date_time'].value = new Date(filterData['table_config']['entry_date_time'].value);
            }
            if (filterData['table_config']['last_price_date'].value) {
                filterData['table_config']['last_price_date'].value = new Date(filterData['table_config']['last_price_date'].value);
            }
            this.primengTable['filters'] = filterData['table_config'];
            this.selectedColumns = this.checkSelectedColumn(filterData['selectedColumns'] || [], this.selectedColumns);
            this.onColumnsChange();
        } else {
            this.selectedColumns = this.checkSelectedColumn([], this.selectedColumns);
            this.onColumnsChange();
        }
    }

    onColumnsChange(): void {
        this._filterService.setSelectedColumns({ name: this.filter_table_name, columns: this.selectedColumns });
    }

    checkSelectedColumn(col: any[], oldCol: Column[]): any[] {
        if (col.length) return col;
        else {
            var Col = this._filterService.getSelectedColumns({ name: this.filter_table_name })?.columns || [];
            if (!Col.length)
                return oldCol;
            else
                return Col;
        }
    }

    isDisplayHashCol(): boolean {
        return this.selectedColumns.length > 0;
    }

    onSelectedColumnsChange(): void {
        this._filterService.setSelectedColumns({ name: this.filter_table_name, columns: this.selectedColumns });
    }


    createData(): void {
        if (!Security.hasNewEntryPermission(module_name.inventoryHoliday)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        // this.matDialog.open(ProductEntryComponent, {
        //     disableClose: true,
        //     data: { id: '' }
        // }).afterClosed().subscribe(res => {
        //     if (res)
        //         this.refreshItems();
        // });
    }

    // editData(record): void {
    //     if (!Security.hasEditEntryPermission(module_name.inventoryHoliday)) {
    //         return this.alertService.showToast('error', messages.permissionDenied);
    //     }

    //     // this.matDialog.open(ProductEntryComponent, {
    //     //     disableClose: true,
    //     //     data: record
    //     // }).afterClosed().subscribe(res => {
    //     //     if (res)
    //     //         this.refreshItems();
    //     // });
    // }

    viewData(record): void {
        if (!Security.hasViewDetailPermission(module_name.inventoryHoliday)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.router.navigate([Routes.inventory.holiday_entry_route + '/' + record.id + '/readonly']);
    }

    deleteData(record: any, index: any): void {
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
                            this.dataList.splice(index, 1);
                            this.alertService.showToast(
                                'success',
                                'Holiday has been deleted!',
                                'top-right',
                                true
                            );
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

        const label: string = record.is_publish_for_bonton
            ? 'Unpublish'
            : 'Publish';
        this.conformationService
            .open({
                title: label + " Holiday",
                message:
                    'Are you sure to ' +

                    label.toLowerCase() +
                    ' ' +

                    record.product_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.holidayService.setHolidayPublish(record.id).subscribe({
                        next: (res: any) => {
                            record.is_publish_for_bonton = !record.is_publish_for_bonton;
                            if (record.is_publish_for_bonton) {
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
            ? 'Make as Unpopular Holiday Product'
            : 'Set as Popular Holiday Product';
        this.conformationService
            .open({
                title: label,
                message: `Are you sure you want to set ${record.product_name} as ${record.is_popular ? 'Unpopular' : 'Popular'}?`
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

    // copy(record): void {
    //     if (!Security.hasPermission(inventoryHolidayPermissions.copyProductPermissions)) {
    //         return this.alertService.showToast('error', messages.permissionDenied);
    //     }

    //     this.conformationService.open({
    //         title: 'Copy Product',
    //         message: 'Are you sure to generate copy of ' + record.product_name + ' ?',
    //     }).afterClosed().subscribe((res) => {
    //         if (res === 'confirmed') {
    //             this.holidayService.CopyProduct(record.id).subscribe({
    //                 next: () => {
    //                     this.alertService.showToast('success', 'Product Copied');
    //                     this.refreshItems();
    //                 }, error: (err) => {
    //                     this.alertService.showToast('error', err);
    //                 }
    //             })
    //         }
    //     });
    // }

    Audit(data: any): void {
        if (!Security.hasPermission(inventoryHolidayPermissions.auditUnauditPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = data.is_audited ? 'UnAudit Holiday Product' : 'Audit Holiday Product';
        this.conformationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ?'
        }).afterClosed().subscribe({
            next: (res) => {
                if (res === 'confirmed') {
                    this.holidayService.setAuditUnaudit(data.id).subscribe({
                        next: (res) => {
                            if (res && res['status']) {
                                if (!data.is_audited) {
                                    this.alertService.showToast('success', "Holiday Product Audited", "top-right", true);
                                } else {
                                    this.alertService.showToast('success', "Holiday Product UnAudited", "top-right", true);
                                }

                                data.is_audited = !data.is_audited;
                            }

                        }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
                    });
                }
            }
        })

    }

    viewDetails(record: any): void {
        if (!Security.hasPermission(inventoryHolidayPermissions.viewHolidayPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const queryParams = {
            id: record.id,
            // date: DateTime.fromISO(record.departure_date).toFormat('yyyy-MM-dd'),
            date: DateTime.now().toFormat('yyyy-MM-dd'),
            adult: 2,
            child: 0,
        };

        const navigationExtras: NavigationExtras = {
            queryParams: {
                "user": JSON.stringify(queryParams)
            }
        };

        // Construct the URL using the Router
        const url = this.router.serializeUrl(
            this.router.createUrlTree(['/inventory/holidayv2-products/view-details'], navigationExtras)
        );

        // Open the URL in a new tab/window
        window.open(url, '_blank');

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

    displayColCount(): number {
        return this.selectedColumns.length + 1;
    }


    isValidDate(value: any): boolean {
        const date = new Date(value);
        return value && !isNaN(date.getTime());
    }

}
