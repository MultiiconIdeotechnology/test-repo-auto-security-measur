import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, Input, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
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
import { module_name } from 'app/security';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject, takeUntil } from 'rxjs';
import { ReceiptInfoEntryComponent } from '../receipt-info-entry/receipt-info-entry.component';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { CrmService } from 'app/services/crm.service';
import { AccountService } from 'app/services/account.service';
import { CommonUtils } from 'app/utils/commonutils';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { EntityService } from 'app/services/entity.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { WalletService } from 'app/services/wallet.service';

@Component({
    selector: 'app-receipts-info-items',
    templateUrl: './receipts-info-installments.component.html',
    styles: [
        `
        .tbl-grid {
            grid-template-columns: 40px 190px 110px 90px 110px 120px 225px;
        }
    `,
    ],
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
    ]
})
export class ReceiptsInfoItemComponent {
    cols = [];
    total = 0;

    dataList: any;
    appConfig = AppConfig;
    isLoading: any;
    searchInputControl = new FormControl('');
    @ViewChild('tabGroup') tabGroup;
    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sort: MatSort;

    Mainmodule: any;
    public _unsubscribeAll: Subject<any> = new Subject<any>();
    public key: any;
    public sortColumn: any;
    public sortDirection: any;

    module_name = module_name.crmagent;
    filter: any = {};
    record: any;
    agentId: any;
    productId: any;

    @Input() receiptDetail: any;
    @Input() recordId: any;

    columns = [
        // {
        //     key: 'index',
        //     name: 'Invoice',
        //     is_date: false,
        //     date_formate: '',
        //     is_sortable: false,
        //     class: '',
        //     is_sticky: false,
        //     align: '',
        //     indicator: false,
        //     tooltip: false,
        //     isicon: true,
        //     isprice: false,
        //     reject_reason: false
        // },
        {
            key: 'receiptRefNo',
            name: 'Reference Number',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            isicon: false,
            isprice: false,
            reject_reason: false,
            reference_number: true
        },
        {
            key: 'receiptDate',
            name: 'Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: '',
            indicator: true,
            tooltip: false,
            is_amount: true,
            isicon: false,
            isprice: false,
            reject_reason: false,
            reference_number: false
        },
        {
            key: 'auditDate',
            name: 'Audit On',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            is_amount: true,
            isicon: false,
            isprice: false,
            reject_reason: false,
            reference_number: false
        },
        {
            key: 'paymentAmount',
            name: 'Amount',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: 'header-right-view',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            isicon: false,
            isprice: true,
            reject_reason: false,
            reference_number: false
        },
        {
            key: 'mop',
            name: 'MOP',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            isicon: false,
            isprice: false,
            reject_reason: false,
            reference_number: false
        },
        {
            key: 'rejectReason',
            name: 'Reject Reason',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            isicon: false,
            isprice: false,
            reject_reason: true,
            reference_number: false
        }
    ]

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any = {},
        private alertService: ToasterService,
        private matDialog: MatDialog,
        private accountService: AccountService,
        private conformationService: FuseConfirmationService,
        private entityService: EntityService,
        private clipboard: Clipboard,
        private crmService: CrmService,
		private walletService: WalletService
    ) {
        this.record = data?.data ?? {}
        // this.dataList = this.record?.receipt;
        this.cols = this.columns.map(x => x.key);
        this.key = this.module_name;
        this.sortColumn = '';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this.agentId = this.record?.agentid;
        // this.productId = this.record?.product_id;
        this.productId = this.record?.id;

        this.entityService.onrefreshReceiptCalll().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                if (item) {
                    if(this.recordId){
                        this.refreshItemsNew();
                    }
                }
            }
        })
    }


    ngOnInit(): void {
        // this.refreshItemsNew();
        setTimeout(() => { }, 3000);
    }

    getStatusIndicatorClass(status: string): string {
        if (status == 'Pending') {
            return 'bg-yellow-600';
        } else if (status == 'Confirmed') {
            return 'bg-green-600';
        } else if (status == 'Rejected') {
            return 'bg-red-600';
        } else {
            return 'bullet-pink';
        }
    }

    getReceiptStatusClass(status: any): any {
        if (status == true) {
            return 'bg-green-600';
        } else if (status == false) {
            return 'bg-red-600';
        } else {
            return '';
        }
    }

    getTooltip(ListItem: any): string {
        if (ListItem?.receiptStatus == 'Rejected') {
            return ListItem?.rejectReason ? ListItem?.rejectReason : '-';
        }
    }

    // createReceipt() {
    //     // if (!Security.hasPermission(partnerPurchaseProductPermissions.purchaseProductPermissions)) {
    //     //     return this.alertService.showToast('error', messages.permissionDenied);
    //     // }

    //     this.matDialog.open(ReceiptInfoEntryComponent, {
    //         data: this.record,
    //         disableClose: true,
    //     }).afterClosed().subscribe({
    //         next: (res) => {
    //             if (res) {
    //                 this.refreshItemsNew();
    //             }
    //         }
    //     });
    // }

    getPaymentIndicatorClass(priority: boolean): string {
        if (priority == true) {
            return 'bg-green-600';
        } else {
            return 'bg-red-600';
        }
    }

    refreshItemsNew() {
        this.isLoading = true;
        // const filterReq = GridUtils.GetFilterReq(
        //     this._paginator,
        //     this._sort,
        //     "",
        // );
        // // filterReq['agent_id'] = this.agentId ? this.agentId : ""
        // filterReq['Id'] = this.productId ? this.productId : ""

        const Id = this.recordId

        this.crmService.getDataProduct(Id).subscribe({
            next: (res) => {
                this.isLoading = false;
                this.receiptDetail = res.receipts;
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    downloadInvoice(bookingId: any) {
        this.accountService.downloadInvoice(bookingId).subscribe({
            next: (res) => {
                CommonUtils.downloadPdf(res?.data, 'Receipt.pdf');
            }, error: (err) => {
                this.alertService.showToast('error', err);
            }
        })
    }

    editAction(record): void {
        // this.matDialog
        //     .open(ReceiptInfoEntryComponent, {
        //         data: record,
        //         disableClose: true,
        //     })
        //     .afterClosed()
        //     .subscribe((res) => {
        //         if (res) {
        //             this.refreshItemsNew();
        //         }
        //     });

        this.entityService.raisereceiptCall({ data: record, edit: true, id: this.recordId });
        // this.entityService.onrefreshReceiptCalll().pipe(takeUntil(this._unsubscribeAll)).subscribe({
        //     next: (item) => {
        //         if (item) {
        //             this.refreshItemsNew();
        //         }
        //     }
        // })
    }

    deleteAction(record): void {
        const label: string = 'Delete Receipt';
        this.conformationService
            .open({
                title: label,
                message: 'Are you sure to ' + label.toLowerCase() + ' ?',
            })
            .afterClosed()
            .subscribe((res) => {
                if (res === 'confirmed') {
                    this.crmService.deleteProductReceipt(record?.receiptId).subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'success',
                                'Receipt has been deleted!',
                                'top-right',
                                true
                            );
                            this.refreshItemsNew();
                        },
                        error: (err) => {
                            this.alertService.showToast(
                                'error',
                                err,
                                'top-right',
                                true
                            );
                        }
                    });
                }
            });
    }

    proofAttachment(data: any) {
        if (data) {
            window.open(data, '_blank')
        }
    }

    paymentAttachment(data: any) {
        if (data) {
            window.open(data, '_blank')
        }
    }

    copyLink(element: any): void {
        if (element) {
            this.clipboard.copy(element?.paymentLink);
            this.alertService.showToast('success', 'Copied');
        }
    }

    generatePaymentLink(data: any) {
        // if (!Security.hasPermission(receiptPermissions.generatePaymentLink)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }

        let newMessage: any;
        const label: string = 'Generate Payment Link'
        newMessage = 'Are you sure to ' + label.toLowerCase() + ' ?'
        this.conformationService.open({
            title: label,
            message: newMessage
        }).afterClosed().subscribe({
            next: (res) => {
                if (res === 'confirmed') {
                    let json = {
                        reference_table_id: data?.receiptId || "",
                        service_for: "Receipt",
                        mop: data?.mop || ""
                    }
                    this.walletService.generatePaymentLink(json).subscribe({
                        next: (res) => {
                            if(res) {
                                this.refreshItemsNew();
                                this.alertService.showToast('success', "Payment link generated successfully!", "top-right", true);
                            }
                        }, error: (err) => this.alertService.showToast('error', err, "top-right", true)
                    });
                }
            }
        })
    }
}
