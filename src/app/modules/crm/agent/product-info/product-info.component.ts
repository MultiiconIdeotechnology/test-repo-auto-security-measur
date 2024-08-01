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
import { RouterOutlet} from '@angular/router';
import { AppConfig } from 'app/config/app-config';
import { Security, module_name, partnerPurchaseProductPermissions} from 'app/security';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PaymentInfoItemComponent } from '../items/payment-info-items.component';
import { InstallmentsInfoItemComponent } from "../installments/payment-info-installments.component";
import { ReceiptsInfoItemComponent } from '../receipts/receipts-info-installments.component';

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
        ReceiptsInfoItemComponent
    ]
})
export class AgentProductInfoComponent{
    dataList = [];
    searchInputControl = new FormControl('');
    @ViewChild('tabGroup') tabGroup;
    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sort: MatSort;
    @ViewChild('receipt') receipt: ReceiptsInfoItemComponent;
    @ViewChild('installments') installments: InstallmentsInfoItemComponent;
    @ViewChild('payments') payments: PaymentInfoItemComponent;

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
    isSecound: boolean = true

    constructor(
        public matDialogRef: MatDialogRef<AgentProductInfoComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.key = this.module_name;
        this.Mainmodule = this,
        this.record = data?.data ?? {}
        this.agencyName = data?.agencyName ?? "";
    }

    ngOnInit(): void {
        if(this.tabNameStr == 'Items'){
            this.payments?.refreshItems();
        }
    }

    getStatusColor(status: string): string {
        if (status == 'Pending') {
            return 'text-yellow-600';
        } else if (status == 'Inprocess') {
            return 'text-blue-600';
        } else if (status == 'Expired') {
            return 'text-red-600';
        } else if (status == 'Cancelled') {
            return 'text-red-600';
        }
        else {
            return '';
        }
    }

    public getTabsPermission(tab: string): boolean {
        if (tab == 'items') {
            return Security.hasPermission(partnerPurchaseProductPermissions.itemsTabPermissions)
        }
        if (tab == 'installments'){
            return Security.hasPermission(partnerPurchaseProductPermissions.installmentsTabPermissions)
        }
        if (tab == 'receipts'){
            return Security.hasPermission(partnerPurchaseProductPermissions.receiptsTabPermissions)
        }
    }


    public tabChanged(event: any): void {
        const tabName = event?.tab?.ariaLabel;
        this.tabNameStr = tabName;
        this.tabName = tabName;

        switch (tabName) {
            case 'Items':
                this.tab = 'items';
                this.payments?.refreshItems();
                break;
            case 'Installments':
                this.tab = 'installments';
                this.installments?.refreshItems();
                break;
            case 'Receipts':
                this.tab = 'receipts';
                this.receipt?.refreshItems();
                break;
        }
    }
}
