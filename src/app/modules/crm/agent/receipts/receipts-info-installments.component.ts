import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
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
import { Subject } from 'rxjs';
import { ReceiptInfoEntryComponent } from '../receipt-info-entry/receipt-info-entry.component';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { CrmService } from 'app/services/crm.service';

@Component({
    selector: 'app-receipts-info-items',
    templateUrl: './receipts-info-installments.component.html',
    styles: [
        `
        .tbl-grid {
            grid-template-columns: 60px 80px 120px 110px 120px 160px;
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

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any = {},
        private alertService: ToasterService,
        private matDialog: MatDialog,
        private crmService: CrmService
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
    }

    columns = [
        {
            key: 'index',
            name: 'Invoice',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            isicon: true
        },
        {
            key: 'is_audited',
            name: 'Audit',
            is_date: true,
            date_formate: '',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            isicon: false,
            isAudited: true
        },
        {
            key: 'receipt_date',
            name: 'Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
            is_amount: true,
            isicon: false
        },
        {
            key: 'payment_amount',
            name: 'Amount',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            isicon: false
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
            isicon: false
        },
        {
            key: 'rm_name',
            name: 'Entry By',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            isicon: false
        }
    ]

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

    ngOnInit(): void {
        this.refreshItems();
    }

    createReceipt() {
        // if (!Security.hasPermission(partnerPurchaseProductPermissions.purchaseProductPermissions)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }

        this.matDialog.open(ReceiptInfoEntryComponent, {
            data: this.record,
            disableClose: true,
        }).afterClosed().subscribe({
            next: (res) => {
                if (res) {
                    this.refreshItems();
                }
            }
        });
    }

    getPaymentIndicatorClass(priority: boolean): string {
        if (priority == true) {
            return 'bg-green-600';
        } else {
            return 'bg-red-600';
        }
    }

    refreshItems() {
        this.isLoading = true;
        const filterReq = GridUtils.GetFilterReq(
            this._paginator,
            this._sort,
            "",
        );
        filterReq['agent_id'] = this.agentId ? this.agentId : ""
        filterReq['Id'] = this.productId ? this.productId : ""
        this.crmService.getProductInfoList(filterReq).subscribe({
            next: (res) => {
                this.isLoading = false;
                this.dataList = res?.data[0];
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

    downloadfile(): void {
        // if (!Security.hasPermission(bookingsHotelPermissions.invoicePermissions)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }

        // console.log("262", this.record);
        // console.log("263", this.agentId);
        // this.crmService.Invoice(this.record?.id).subscribe({
        //     next: (res) => {
        //         CommonUtils.downloadPdf(res.data, 'receipt.pdf');
        //     }, error: (err) => {
        //         this.alertService.showToast('error', err)
        //     }
        // })
    }
}
