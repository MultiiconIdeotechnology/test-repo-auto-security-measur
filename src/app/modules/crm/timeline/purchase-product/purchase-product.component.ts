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
import { module_name } from 'app/security';
import { CrmService } from 'app/services/crm.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';
import { TimelineAgentProductInfoComponent } from '../product-info/product-info.component';

@Component({
    selector: 'app-timeline-purchase-product',
    templateUrl: './purchase-product.component.html',
    styles: [`.tbl-grid { grid-template-columns: 40px 135px 50px 100px 80px 105px 125px 115px 85px 80px }`],
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
        MatProgressBarModule
    ]
})
export class TimelinePurchaseProductComponent {
    module_name = module_name.crmagent;
    cols = [];
    total = 0;
    record: any = {};
    agentId: any;

    constructor(
        private crmService: CrmService,
        private alertService: ToasterService,
        private matDialog: MatDialog,
        private confirmationService: FuseConfirmationService,
        public matDialogRef: MatDialogRef<TimelinePurchaseProductComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any = {}
    ) {
        this.record = data?.data ?? {}
        this.cols = this.columns.map(x => x.key);
        this.key = this.module_name;
        this.sortColumn = 'priorityid';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this.agentId = this.record?.agentid;
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
            indicator: false,
            tooltip: true,
            applied: false
        },
        {
            key: 'itemCount',
            name: 'Items',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: '',
            is_sticky: false,
            indicator: false,
            tooltip: false,
            align: 'left',
            applied: false
        },
        {
            key: 'count',
            name: 'Installments',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: 'left',
            indicator: false,
            tooltip: false,
            applied: false
        },
        {
            key: 'product_status',
            name: 'Status',
            is_date: false,
            date_formate: '',
            is_sortable: true,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: true,
            toColor: true,
            applied: false
        },
        {
            key: 'is_payment_due',
            name: 'Payment Due',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false,
            payment: true,
            applied: false
        },
        {
            key: 'start_integration',
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
        {
            key: 'acivation_date',
            name: 'Activation Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: 'left',
            indicator: false,
            tooltip: false,
            applied: false
        },
        {
            key: 'expiry_date',
            name: 'Expiry Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: 'left',
            indicator: false,
            tooltip: false,
            applied: false
        },
        {
            key: 'entry_date',
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
        } else if (status == 'Inprocess') {
            return 'text-blue-600';
        } else if (status == 'Delivered') {
            return 'text-blue-600';
        } else {
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
            this.searchInputControlpartners.value
        );
        filterReq['agent_id'] = this.agentId ? this.agentId : ""
        this.crmService.getProductPurchaseMasterList(filterReq).subscribe({
            next: (data) => {
                this.isLoading = false;
                this.dataList = data?.data;
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

    purchaseProductInfo(record, agencyName): void{
        // if (!Security.hasNewEntryPermission(module_name.crmagent)) {
        //     return this.alertService.showToast('error', messages.permissionDenied);
        // }

        this.matDialog.open(TimelineAgentProductInfoComponent, {
            data: { data: record, agencyName: agencyName, readonly: true },
            disableClose: true
        });
    }

    paymentProduct() {

    }
}
