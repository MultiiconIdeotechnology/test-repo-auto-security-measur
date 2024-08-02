import { Security, messages, module_name, supplierAPIPermissions } from 'app/security';
import { NgIf, NgFor, DatePipe, NgClass, CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { SupplierApiEntryComponent } from '../supplier-api-entry/supplier-api-entry.component';
import { SupplierApiService } from 'app/services/supplier-api.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToasterService } from 'app/services/toaster.service';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { FlightTabService } from 'app/services/flight-tab.service';

@Component({
    selector: 'app-supplier-api-list',
    templateUrl: './supplier-api-list.component.html',
    styleUrls: ['./supplier-api-list.component.scss'],
    styles: [
        `
            .tbl-grid {
                grid-template-columns: 40px 50px 80px 200px 150px 150px;
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
        MatMenuModule,
        MatDialogModule,
        MatTooltipModule,
        MatDividerModule,
        PrimeNgImportsModule
    ],
})
export class SupplierApiListComponent
    extends BaseListingComponent
    implements OnDestroy {
    module_name = module_name.supplierapi;
    dataList = [];
    total = 0;
    supplierList:any[] = [];
    selectedSupplier:string;

    columns = [
        {
            key: 'supplier_api_id',
            name: 'ID',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true
        },
        {
            key: 'is_live',
            name: 'Status',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
            isLive: true
        },
        {
            key: 'supplier_name',
            name: 'Supplier Name',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: true,
            tooltip: true
        },
        // {
        //     key: 'api_for',
        //     name: 'API For',
        //     is_date: false,
        //     date_formate: '',
        //     is_sortable: true,
        //     class: '',
        //     is_sticky: false,
        //     align: '',
        //     indicator: false,
        //     tooltip: true
        // },
        // {
        //     key: 'user_id',
        //     name: 'User ID',
        //     is_date: false,
        //     date_formate: '',
        //     is_sortable: true,
        //     class: '',
        //     is_sticky: false,
        //     align: '',
        //     indicator: false,
        //     tooltip: true
        // },
        // {
        //     key: 'api_key',
        //     name: 'API Key',
        //     is_date: false,
        //     date_formate: '',
        //     is_sortable: true,
        //     class: '',
        //     is_sticky: false,
        //     align: '',
        //     indicator: false,
        //     tooltip: true
        // },
        {
            key: 'enable_for',
            name: 'Enable For',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true
        },
        {
            key: 'inventory_for',
            name: 'Inventory Type',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true
        }
    ];
    cols = [];
    _selectedColumns: Column[];
    isFilterShow: boolean = false;
    liveStatusList = [
        {label: 'Live', value: true},
        {label: 'Test', value: false},
    ]

    constructor(
        private supplierapiService: SupplierApiService,
        private conformationService: FuseConfirmationService,
        private matDialog: MatDialog,
        private flighttabService: FlightTabService,
        private toasterService: ToasterService
    ) {
        super(module_name.supplierapi);
        this.cols = this.columns.map((x) => x.key);
        this.key = this.module_name;
        this.sortColumn = 'supplier_name';
        this.sortDirection = 'asc';
        this.Mainmodule = this;
    }

    ngOnInit() {
        this.cols = [
            { field: 'api_for', header: 'Api For' },
        ];

        this.getSupplierList();
    }

    get selectedColumns(): Column[] {
        return this._selectedColumns;
    }

    set selectedColumns(val: Column[]) {
        this._selectedColumns = this.cols.filter((col) => val.includes(col));
    }

    refreshItems(event?:any): void {
        this.isLoading = true;
        this.supplierapiService
            .getSupplierWiseApiList(this.getNewFilterReq(event))
            .subscribe({
                next: (data) => {
                    this.isLoading = false;
                    this.dataList = data.data;
                    this.totalRecords = data.total;
                },
                error: (err) => {
                    this.toasterService.showToast('error', err)
                    this.isLoading = false;
                },
            });
    }

    // Api to get the Supplier List
    getSupplierList(){
        this.flighttabService.getSupplierBoCombo('').subscribe((data:any) => {
            this.supplierList = data;
        })
    }

    getNodataText(): string {
        if (this.isLoading) return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    showBtn = false;

    passwordShow(data: any) {
        this.showBtn = !this.showBtn;
    }

    ngOnDestroy(): void {
        // this.masterService.setData(this.key, this);
    }

    /***/
    createInternal(model): void {
        this.matDialog
            .open(SupplierApiEntryComponent, {
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
            .open(SupplierApiEntryComponent, {
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
        this.matDialog.open(SupplierApiEntryComponent, {
            data: { data: record, readonly: true },
            disableClose: true,
        });
    }

    deleteInternal(record): void {
        const label: string = 'Delete Supplier API';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.supplier_name +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.supplierapiService.delete(record.id).subscribe({
                        next: () => {
                            this.toasterService.showToast(
                                'success',
                                'Supplier API has been Deleted!',
                                'top-right',
                                true
                            );
                            this.refreshItems();
                        },
                        error: (err) => {
                            this.alertService.showToast('error', err)

                        },
                    });
                }
            });
    }



    EnableDisable(record): void {
        if (!Security.hasPermission(supplierAPIPermissions.enableDisablePermissions)) {
            return this.toasterService.showToast('error', messages.permissionDenied);
        }

        const label: string = record.is_disabled
            ? 'Enable Supplier API'
            : 'Disable Supplier API';
        this.conformationService
            .open({
                title: label,
                message:
                    'Are you sure to ' +
                    label.toLowerCase() +
                    ' ' +
                    record.api_for +
                    ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.supplierapiService
                        .setEnableDisable(record.id)
                        .subscribe({
                            next: () => {
                                record.is_disabled = !record.is_disabled;
                                if (record.is_disabled) {
                                    this.alertService.showToast(
                                        'success',
                                        'Supplier API has been Disabled!',
                                        'top-right',
                                        true
                                    );
                                } else {
                                    this.alertService.showToast(
                                        'success',
                                        'Supplier API has been Enabled!',
                                        'top-right',
                                        true
                                    );
                                }
                            },
                            error: (err) => {
                                this.alertService.showToast('error', err)

                            },
                        });
                }
            });
    }
}
