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
import { CrmService } from 'app/services/crm.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-payment-info-items',
    templateUrl: './payment-info-items.component.html',
    styles: [
        `
        .tbl-grid {
            grid-template-columns: 400px 150px 150px 130px;
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
export class PaymentInfoItemComponent {
    cols = [];
    total = 0;

    columns = [
        {
            key: 'itemName',
            name: 'Service',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            itemName: true
        },
        {
            key: 'status',
            name: 'Status',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            toColor: true
        },
        {
            key: 'acivation_date',
            name: 'Activation Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false,
        },
        {
            key: 'expiry_date',
            name: 'Expiry Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: 'center',
            indicator: false,
            tooltip: false,
            lastLogin: true
        }
    ]
    dataList: any;
    dataListItems: any;
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

    @Input() servicesDetail: any;

    module_name = module_name.crmagent
    filter: any = {}
    record: any;
    agentId: any;
    productId: any;

    ngOnInit(): void {
        setTimeout(() => {
        }, 3000);
    }

    refreshItems() {
        this.isLoading = true;
        const filterReq = GridUtils.GetFilterReq(
            this._paginator,
            this._sort,
            "",
        );
        // filterReq['agent_id'] = this.agentId ? this.agentId : ""
        filterReq['Id'] = this.productId ? this.productId : ""
        this.crmService.getProductInfoList(filterReq).subscribe({
            next: (res) => {
                this.isLoading = false;
                this.dataList = res[0];
                //this.dataList = res?.data[0];
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
        } else if (status == 'Delivered') {
            return 'text-green-600';
        } else if (status == 'Waiting for Customer Update') {
            return 'text-orange-600';
        } else if (status == 'Waiting for Account Activation') {
            return 'text-orange-600';
        } else if (status == 'Inprocess') {
            return 'text-blue-600';
        } else if (status == 'Rejected from Store' || status == 'Cancel' || status == 'Sales Return' || status == 'Cancelled') {
            return 'text-red-600';
        } else if (status == 'Expired') {
            return 'text-red-600';
        }
        else {
            return '';
        }
    }

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any = {},
        private alertService: ToasterService,
        private crmService: CrmService
    ) {
        this.record = data?.data ?? {}
        // this.dataList = this.record?.item;
        this.cols = this.columns.map(x => x.key);
        this.key = this.module_name;
        this.sortColumn = 'priorityid';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this.agentId = this.record?.agentid;
         // this.productId = this.record?.product_id;
         this.productId = this.record?.id;
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }
}
