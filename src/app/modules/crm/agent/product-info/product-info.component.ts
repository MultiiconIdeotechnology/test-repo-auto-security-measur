import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterOutlet } from '@angular/router';
import { AppConfig } from 'app/config/app-config';
import { Security, module_name, partnerPurchaseProductPermissions } from 'app/security';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PaymentInfoItemComponent } from '../items/payment-info-items.component';
import { InstallmentsInfoItemComponent } from "../installments/payment-info-installments.component";
import { ReceiptsInfoItemComponent } from '../receipts/receipts-info-installments.component';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { CrmService } from 'app/services/crm.service';
import { ToasterService } from 'app/services/toaster.service';
import { Subject } from 'rxjs';
import { EntityService } from 'app/services/entity.service';
import { ReceiptRightComponent } from "../receipt-right/receipt-right.component";
import { PaymentInfoWLSetttingLinkComponent } from '../wl-settings-link/payment-info-wl-settings-link.component';
import { Linq } from 'app/utils/linq';
import { PaymentInfoSalesReturnComponent } from "../sales-return/payment-info-sales-return.component";
import { ProductLogsComponent } from '../product-logs/product-logs.component';
import { StatusChangeLogsComponent } from '../status-change-logs/status-change-logs.component';

@Component({
    selector: 'app-product-info',
    templateUrl: './product-info.component.html',
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
        MatCheckboxModule,
        PaymentInfoItemComponent,
        InstallmentsInfoItemComponent,
        ReceiptsInfoItemComponent,
        ReceiptRightComponent,
        PaymentInfoWLSetttingLinkComponent,
        PaymentInfoSalesReturnComponent,
        ProductLogsComponent,
        StatusChangeLogsComponent
    ]
})
export class AgentProductInfoComponent {
    dataList: any = {};
    itemdataList = [];
    searchInputControl = new FormControl('');
    @ViewChild('tabGroup') tabGroup;
    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sort: MatSort;
    // @ViewChild('receipts') receipts: ReceiptsInfoItemComponent;
    @ViewChild('wlsettinglinks') wlsettinglinks: ReceiptsInfoItemComponent;
    @ViewChild('salesreturn') salesreturn: PaymentInfoSalesReturnComponent;
    // @ViewChild('installments') installments: InstallmentsInfoItemComponent;
    // @ViewChild('payments') payments: PaymentInfoItemComponent;
    public _unsubscribeAll: Subject<any> = new Subject<any>();

    title = "Product";
    Mainmodule: any;
    isLoading = false;
    public key: any;
    public sortColumn: any;
    public sortDirection: any;
    module_name = module_name.crmagent
    total = 0;
    appConfig = AppConfig;
    record: any = {};
    agencyName: any;
    is_schedule_call: FormControl;
    tabName: any
    tabNameStr: any = 'Items'
    tab: string = 'Items';
    isFirst: boolean = true;
    isSecound: boolean = true
    productId: any;
    service_for_id: any;
    getWLSettingList = [];
    currencySymbol: any;
    mainData: any;
    Id: any;

    constructor(
        // private matDialog: MatDialog,
        private crmService: CrmService,
        private entityService: EntityService,
        public matDialogRef: MatDialogRef<AgentProductInfoComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any = {},
        @Inject(MAT_DIALOG_DATA) public receipt_reg: any,
        @Inject(MAT_DIALOG_DATA) public account_reg: any,
        @Inject(MAT_DIALOG_DATA) public purchase_reg: any,
        @Inject(MAT_DIALOG_DATA) public sales_product_reg: any,
        @Inject(MAT_DIALOG_DATA) public agent_info_reg: any,
        private router: Router,
        private alertService: ToasterService
    ) {

        this.mainData = data
        console.log(" 139 info main this.record", data);



        // super(module_name.crmagent)
        this.key = this.module_name;
        // this.Mainmodule = this,
        this.record = data?.data ?? {}



        this.currencySymbol = this.record?.currencySymbol?.trim();
        this.agencyName = data?.agencyName ?? "";
        this.productId = this.record?.id;
        this.service_for_id = this.record?.service_for_id;

        // if (purchase_reg?.purchase_product) {
        //     console.log("purchase_reg");

        //     this.wlSetting(this.record?.agentid);
        //     this.record = data?.data ?? {}
        //     this.agencyName = data?.agencyName ?? "";

        //     this.productId = this.record?.id;
        //     this.service_for_id = this.record?.service_for_id;
        // }

        // if (receipt_reg?.receipt_register) {
        //     console.log("receipt_reg");
        //     this.wlSetting(this.record?.agent_id);
        //     this.record = this.record ?? {}
        //     this.agencyName = this.record?.agent_name ?? "";

        //     this.productId = this.record?.product_id;
        //     this.service_for_id = this.record?.service_for_id;
        // }

        // if (account_reg?.account_receipt) {
        //     console.log("account_reg");
        //     this.wlSetting(this.record?.agent_id);
        //     this.record = this.record ?? {}
        //     this.agencyName = this.record?.agent_name ?? "";

        //     this.productId = this.record?.product_id;
        //     this.service_for_id = this.record?.service_for_id;
        // }

        // if (sales_product_reg?.sales_product) {
        //     console.log("sales_product_reg");
        //     this.wlSetting(this.record?.agent_id);
        //     this.record = this.record ?? {}
        //     this.agencyName = this.record?.agency_name ?? "";

        //     this.productId = this.data?.item?.purchase_id
        //     this.service_for_id = this.data?.item?.purchase_id
        // }

        // if (agent_info_reg?.agentInfo) {
        //     console.log("agent_info_reg");
        //     this.wlSetting(this.record?.agentid);
        //     this.record = this.record ?? {}
        //     this.agencyName = this.record?.agency_name ?? "";
        // }

        // this.entityService.onrefreshReceiptCalll().pipe(takeUntil(this._unsubscribeAll)).subscribe({
        //     next: (item) => {
        //         this.receipts.refreshItemsNew();
        //     }
        // })
    }

    ngOnInit(): void {
        // if (this.tabNameStr == 'Items') {
        //     this.payments?.refreshItems();
        // }
        this.refreshItemsNew();
    }

    // new info
    refreshItemsNew() {
        this.isLoading = true;

        if (this.mainData?.receipt_register || this.mainData?.account_receipt || this.mainData?.sales_product) {
            this.Id = this.record.product_id
        }else{
            this.Id = this.record.id
        }


        this.crmService.getDataProduct(this.Id).subscribe({
            next: (res) => {
                this.isLoading = false;
                this.dataList = res;
                this.wlSetting(this.dataList?.agentId);
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }

    public wlSetting(record): void {
        this.crmService.getWLSettingList(record).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.getWLSettingList = data[0];
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }

    getStatusColor(status: string): string {
        if (status == 'Pending') {
            return 'text-yellow-600';
        } else if (status == 'Inprocess') {
            return 'text-blue-600';
        } else if (status == 'Expired') {
            return 'text-red-600';
        } else if (status == 'Cancelled' || status == 'Cancel' || status == 'Block' || status == 'Blocked' || status == 'Sales Return' || status == 'Cancelled') {
            return 'text-red-600';
        } else if (status == 'Delivered') {
            return 'text-green-600';
        } else {
            return '';
        }
    }

    public getTabsPermission(tab: string): boolean {
        if (tab == 'items') {
            return Security.hasPermission(partnerPurchaseProductPermissions.itemsTabPermissions)
        }
        if (tab == 'installments') {
            return Security.hasPermission(partnerPurchaseProductPermissions.installmentsTabPermissions)
        }
        if (tab == 'receipts') {
            return Security.hasPermission(partnerPurchaseProductPermissions.receiptsTabPermissions)
        }
        if (tab == 'logs') {
            return Security.hasPermission(partnerPurchaseProductPermissions.logsTabPermissions)
        }
        if (tab == 'statusChangeLogs') {
            return Security.hasPermission(partnerPurchaseProductPermissions.statusChangeLogsTabPermissions)
        }
    }



    public tabChanged(event: any): void {
        const tabName = event?.tab?.ariaLabel;
        this.tabNameStr = tabName;
        this.tabName = tabName;

        switch (tabName) {
            case 'Items':
                this.tab = 'items';
                // this.payments?.refreshItems();
                break;
            case 'Installments':
                this.tab = 'installments';
                // if (this.isSecound) {
                //     this.installments?.refreshItems();
                //     this.isSecound = false;
                // }
                break;
            case 'Receipts':
                this.tab = 'receipts';
                // this.receipts?.refreshItemsNew();
                break;
            case 'WL-Setting Links':
                this.tab = 'wlsettinglinks';
                break;

            case 'Sales Return':
                this.tab = 'salesreturn';
                break;

            case 'Logs':
                this.tab = 'logs';
                break;

            case 'Status Change Logs':
                this.tab = 'statusChangeLogs';
                break;
        }
    }

    downloadfile(data: any) {
        if (data) {
            window.open(data, '_blank')
        }
    }

    createReceipt() {
        // if (!Security.hasNewEntryPermission(module_name.crmagent)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }

        // this.matDialog.open(ReceiptInfoEntryComponent, {
        //     data: this.record,
        //     disableClose: true,
        // }).afterClosed().subscribe({
        //     next: (res) => {
        //         this.receipts.refreshItemsNew();
        //     }
        // });

        this.entityService.raisereceiptCall({ data: this.record });
    }

    agentDetail(listingId: any) {
        Linq.recirect('/customers/agent/entry/' + listingId + '/readonly');
        // this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => this.router.navigate([uri]));
    }

    // refreshItemsNew() {
    //     this.isLoading = true;
    //     const filterReq = GridUtils.GetFilterReq(
    //         this._paginator,
    //         this._sort,
    //         "",
    //     );
    //     // filterReq['agent_id'] = this.agentId ? this.agentId : ""
    //     filterReq['Id'] = this.productId ? this.productId : this.service_for_id;
    //     this.crmService.getProductInfoList(filterReq).subscribe({
    //         next: (res) => {
    //             this.isLoading = false;
    //             this.dataList = res[0];
    //             // this.currencySymbol = this.dataList?.['currencySymbol'];
    //         },
    //         error: (err) => {
    //             this.alertService.showToast('error', err, 'top-right', true);
    //             this.isLoading = false;
    //         },
    //     });

    // }   


}
