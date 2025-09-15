import { FuseConfirmationService } from './../../../../../@fuse/services/confirmation/confirmation.service';
import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { AppConfig } from 'app/config/app-config';
import { agentPermissions, messages, module_name, Security } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject, takeUntil } from 'rxjs';
import { AgentProductInfoComponent } from '../product-info/product-info.component';
import { PurchaseProductEntrySettingsComponent } from "../purchase-product-entry-settings/purchase-product-entry-settings.component";
import { EntityService } from 'app/services/entity.service';
import { CRMSalesReturnRightComponent } from "../sales-return-right/sales-return-right.component";
import { BlockReasonComponent } from 'app/modules/masters/supplier/block-reason/block-reason.component';
import { MasterAgentComponent } from '../master-agent/master-agent.component';

@Component({
    selector: 'app-purchase-product',
    templateUrl: './purchase-product.component.html',
    styles: [`.tbl-grid { grid-template-columns: 40px 190px 45px 100px 110px 105px 120px 130px 85px}`],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        AsyncPipe,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatSlideToggleModule,
        NgxMatSelectSearchModule,
        MatTooltipModule,
        MatAutocompleteModule,
        RouterOutlet,
        MatOptionModule,
        MatDividerModule,
        MatSortModule,
        MatTableModule,
        MatPaginatorModule,
        MatMenuModule,
        MatDialogModule,
        CommonModule,
        MatTabsModule,
        MatProgressBarModule,
        PurchaseProductEntrySettingsComponent,
        CRMSalesReturnRightComponent
    ]
})
export class PurchaseProductComponent {
    module_name = module_name.crmagent;
    cols = [];
    total = 0;
    record: any = {};
    agentId: any;
    currencySymbol: any;

    constructor(
        private crmService: CrmService,
        private alertService: ToasterService,
        private matDialog: MatDialog,
        private entityService: EntityService,
        private confirmationService: FuseConfirmationService,
        public matDialogRef: MatDialogRef<PurchaseProductComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.record = data?.data ?? {}
        this.cols = this.columns.map(x => x.key);
        this.key = this.module_name;
        this.sortColumn = 'priorityid';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this.agentId = this.record?.agentid;
        this.currencySymbol = this.record?.currencySymbol;

        this.entityService.onrefreshproductPurchaseCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                if (item) {
                    this.refreshItems();
                }
            }
        });

        this.entityService.onCRMrefreshSalesReturnCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                if (item) {
                    this.refreshItems();
                }
            }
        });
    }

    columns = [
        {
            key: 'productName',
            name: 'Product',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
            applied: false,
            toProduct: true,
        },
        {
            key: 'itemCount',
            name: 'Items',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: ' pr-[10px]',
            is_sticky: false,
            indicator: false,
            tooltip: false,
            align: 'center',
            applied: false
        },
        {
            key: 'installmentCount',
            name: 'Installments',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: ' pr-[15px]',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false,
            applied: false
        },
        {
            key: 'status',
            name: 'Status',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            toColor: true,
            applied: false
        },
        {
            key: 'purchasePrice',
            name: 'Price',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: ' header-right-view',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            applied: false,
            price: true,
            dueAmount: false
        },
        {
            key: 'dueAmount',
            name: 'Due Amount',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: ' header-right-view',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            applied: false,
            price: false,
            dueAmount: true
        },
        // {
        //     key: 'is_payment_due',
        //     name: 'Payment Due',
        //     is_date: false,
        //     date_formate: '',
        //     is_sortable: false,
        //     class: '',
        //     is_sticky: false,
        //     align: 'center',
        //     indicator: false,
        //     tooltip: false,
        //     payment: true,
        //     applied: false
        // },
        {
            key: 'startIntegration',
            name: 'Start Integration',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: true,
            tooltip: false,
            startIntegration: true,
            applied: false
        },
        // {
        //     key: 'acivation_date',
        //     name: 'Activation Date',
        //     is_date: true,
        //     date_formate: 'dd-MM-yyyy',
        //     is_sortable: false,
        //     class: '',
        //     is_sticky: false,
        //     align: 'left',
        //     indicator: false,
        //     tooltip: false,
        //     applied: false
        // },
        // {
        //     key: 'expiry_date',
        //     name: 'Expiry Date',
        //     is_date: true,
        //     date_formate: 'dd-MM-yyyy',
        //     is_sortable: false,
        //     class: '',
        //     is_sticky: false,
        //     align: 'left',
        //     indicator: false,
        //     tooltip: false,
        //     applied: false
        // },
        {
            key: 'entryDate',
            name: 'Entry Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: 'left',
            indicator: false,
            tooltip: false,
            applied: false
        }
    ]

    dataList: any;
    appConfig = AppConfig;
    isLoading: any;
    searchInputControlpartners = new FormControl('');
    @ViewChild('tabGroup') tabGroup;
    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sort: MatSort;

    Mainmodule: any;
    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;
    filter: any = {}

    ngOnInit(): void {
        this.searchInputControlpartners.valueChanges
            .subscribe(() => {
                GridUtils.resetPaginator(this._paginator);
                this.refreshItems();
            });
        this.refreshItems();
    }

    getStatusColor(status: string): string {
        if (status == 'Pending') {
            return 'text-yellow-600';
        } else if (status == 'Sales Return' || status == 'Cancelled') {
            return 'text-red-600';
        } else if (status == 'Inprocess') {
            return 'text-green-600';
        } else if (status == 'Delivered') {
            return 'text-blue-600';
        } else if (status == 'Expired' || status == 'Cancel' || status == 'Block' || status == 'Blocked' || status == 'Cancelled') {
            return 'text-red-600';
        } {
            return '';
        }
    }

    getPaymentColor(color: boolean): string {
        if (color == true) {
            return 'text-green-600';
        } else if (color == false) {
            return 'text-red-600';
        } else {
            return '';
        }
    }

    getStartIntegrationColor(color: boolean): string {
        if (color == true) {
            return 'text-green-600';
        } else if (color == false) {
            return 'text-red-600';
        } else {
            return '';
        }
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControlpartners.value)
            return `no search results found for \'${this.searchInputControlpartners.value}\'.`;
        else return 'No data to display';
    }


    getPriorityIndicatorClass(priority: string): string {
        if (priority == 'High') {
            return 'bg-red-600';
        } else if (priority == 'Medium') {
            return 'bg-yellow-600';
        } else {
            return 'bullet-pink';
        }
    }

    refreshItems() {
        this.isLoading = true;
        const filterReq = GridUtils.GetFilterReq(
            this._paginator,
            this._sort,
            this.searchInputControlpartners.value,
        );
        filterReq['agent_id'] = this.agentId ? this.agentId : ""
        this.crmService.getProductPurchaseMasterList(filterReq).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data?.data;
                if (this.dataList?.length && !this.currencySymbol) {
                    this.currencySymbol = this.dataList[0]?.['currencySymbol'];
                }
                // this.dataList?.forEach((row) => {
                //     row['count_product_list'] = row['item'].length;
                //   });
                this._paginator.length = data.total;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }

    setBlockUnblock(record): void {
        if (!Security.hasPermission(agentPermissions.blockUnblockPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        if (record.isBlocked) {
            const label: string = 'Unblock Product'
            this.confirmationService.open({
                title: label,
                message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.productName + ' ?'
            }).afterClosed().subscribe(res => {
                if (res === 'confirmed') {
                    const json = {
                        ProductId: record.id,
                        Isblock: false,
                        BlockRemarks: ''
                    }
                    this.crmService.blockUnblock(json).subscribe({
                        next: () => {
                            record.isBlocked = !record.isBlocked;
                            this.alertService.showToast('success', "Product has been Unblock!", "top-right", true);
                            this.refreshItems();

                        },
                        error: (err) => {
                            this.alertService.showToast('error', err, 'top-right', true);
                        },
                    })
                }
            })
        } else {
            this.matDialog.open(BlockReasonComponent, {
                data: record,
                disableClose: true
            }).afterClosed().subscribe(res => {
                if (res) {
                    const json = {
                        ProductId: record.id,
                        Isblock: true,
                        BlockRemarks: res
                    }
                    this.crmService.blockUnblock(json).subscribe({
                        next: () => {
                            record.isBlocked = !record.isBlocked;
                            this.alertService.showToast('success', "Product has been Block!", "top-right", true);
                            this.refreshItems();

                        },
                        error: (err) => {
                            this.alertService.showToast('error', err, 'top-right', true);
                        },
                    })
                }
            })
        }
    }

    shiftProduct(record) {
         if (!Security.hasPermission(agentPermissions.shiftProductPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        this.matDialog.open(MasterAgentComponent, {
            data: record,
            disableClose: true
        })
    }

    purchaseProductInfo(record, agencyName): void {
            // if (!Security.hasNewEntryPermission(module_name.crmagent)) {
            //     return this.alertService.showToast('error', messages.permissionDenied);
            // }
            this.matDialog.open(AgentProductInfoComponent, {
                data: { data: record, agencyName: agencyName, readonly: true, purchase_product: true, currencySymbol: this.currencySymbol },
                disableClose: true
            });
        }

    createInternal() {
            // if (!Security.hasNewEntryPermission(module_name.crmagent)) {
            //     return this.alertService.showToast('error', messages.permissionDenied);
            // }
            // this.matDialog.open(PurchaseProductEntryComponent,
            //     { data: this.record, disableClose: true })
            //     .afterClosed()
            //     .subscribe((res) => {
            //         if (res) {
            //             this.refreshItems();
            //             this.alertService.showToast(
            //                 'success',
            //                 'New record added',
            //                 'top-right',
            //                 true
            //             );
            //         }
            //     });
            this.entityService.raiseproductPurchaseCall({ data: this.record, addFlag: true })
        }

    deleteProduct(record) {
            if(!Security.hasPermission(agentPermissions.deleteProductPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Delete Purchase product'
        this.confirmationService.open({
            title: label,
            message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.productName + ' ?'
        }).afterClosed().subscribe(res => {
            if (res === 'confirmed') {
                // const json = {
                //     id: record.id
                // }
                this.crmService.deletePurchaseProduct(record.id).subscribe({
                    next: (res) => {
                        if (res)
                            this.alertService.showToast('success', "Purchase product has been deleted!", "top-right", true);
                        this.refreshItems()
                    },
                    error: (err) => {
                        this.alertService.showToast('error', err, "top-right", true);
                    }
                })
            }
        })
    }

    cancelProduct(record) {
        if (!Security.hasPermission(agentPermissions.cancelProductPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Cancel Purchase product';
        this.confirmationService
            .open({
                title: label,
                message: 'Do you want to Cancel?',
                inputBox: 'Remark',
                customShow: true,
                dateCustomShow: false
            })
            .afterClosed()
            .subscribe((res) => {
                if (res?.action === 'confirmed') {
                    let newJson = {
                        id: record.id,
                        CancelRemark: res?.statusRemark ? res?.statusRemark : ""
                    }
                    this.crmService.cancelPurchaseProduct(newJson).subscribe({
                        next: (res) => {
                            if (res) {

                                this.alertService.showToast(
                                    'success',
                                    'Purchase product has been cancelled!',
                                    'top-right',
                                    true
                                );
                                this.refreshItems()
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

    expiryProduct(record) {
        if (!Security.hasPermission(agentPermissions.expiryProductPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const label: string = 'Expiry Product';
        this.confirmationService
            .open({
                title: label,
                message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.productName + ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    let payload = {
                        id: record.id
                    }
                    this.crmService.expiryProduct(payload).subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'success',
                                'Product has been expired!',
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

    editProduct(record) {
        if (record.status != 'New') {
            this.alertService.showToast('error', 'Only new status product has been allow for modify.', 'top-right', true);
            return
        }

        this.entityService.raiseproductPurchaseCall({ editData: record, editFlag: true })

        // if (!Security.hasNewEntryPermission(module_name.crmagent)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }
        // this.matDialog.open(PurchaseProductEntryComponent, {
        //     data: { editData: record, editFlag: true },
        //     disableClose: true
        // }).afterClosed()
        //     .subscribe((res) => {
        //         if (res) {
        //             this.refreshItems();
        //             this.alertService.showToast(
        //                 'success',
        //                 'Record modified',
        //                 'top-right',
        //                 true
        //             );
        //         }
        //     });
    }

    salesReturnProduct(record) {
        if (!Security.hasPermission(agentPermissions.salesReturnProductPermissions)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

         if (record.receiptStatus === 'Confirmed' && record.status !== 'Sales Return') {
            this.entityService.raiseCRMSalesReturnCall({ add: true, data: record })
        } else {
            this.alertService.showToast('error', 'Sales return not possible, because there is no any payment received.');
            return;
        }

        // this.entityService.raiseCRMSalesReturnCall({ add: true, data: record })
    }
}
