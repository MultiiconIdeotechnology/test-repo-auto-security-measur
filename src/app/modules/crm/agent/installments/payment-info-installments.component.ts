import { NgIf, NgFor, NgClass, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, Input, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
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
import { EntityService } from 'app/services/entity.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject, takeUntil } from 'rxjs';
import { InstallmentRightComponent } from '../installment-right/installment-right.component';

@Component({
    selector: 'app-installments-info-items',
    templateUrl: './payment-info-installments.component.html',
    styles: [
        `
        .tbl-grid {
            grid-template-columns: 40px 160px 130px 150px 150px 120px;
        }`,
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
        InstallmentRightComponent
    ]
})
export class InstallmentsInfoItemComponent {
    cols = [];
    total = 0;

    @Input() installmentDetail: any;
    @Input() recordId: any;

    columns = [
        {
            key: 'installmentDate',
            name: 'Installment Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: false,
            class: '',
            is_sticky: false,
            align: '',
            indicator: true,
            tooltip: false,
            installmentAmount: false,
            receivedAmount: false,
            dueAmount: false
        },
        {
            key: 'installmentAmount',
            name: 'Amount',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: ' header-right-view',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            is_amount: true,
            installmentAmount: true,
            receivedAmount: false,
            dueAmount: false
        },
        {
            key: 'paymentDate',
            name: 'Payment Date',
            is_date: true,
            date_formate: 'dd-MM-yyyy',
            is_sortable: false,
            class: ' pl-8',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            installmentAmount: false,
            receivedAmount: false,
            dueAmount: false
        },
        {
            key: 'paymentAmount',
            name: 'Received Amount',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: ' header-right-view',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            installmentAmount: false,
            receivedAmount: true,
            dueAmount: false
        },
        {
            key: 'dueAmount',
            name: 'Due Amount',
            is_date: false,
            date_formate: '',
            is_sortable: false,
            class: ' header-right-view',
            is_sticky: false,
            align: '',
            indicator: false,
            tooltip: false,
            installmentAmount: false,
            receivedAmount: false,
            dueAmount: true
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

    

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any = {},
        private alertService: ToasterService,
        private crmService: CrmService,
        private entityService: EntityService
    ) {
        this.record = data?.data ?? {}
        this.dataList = this.record?.installment;
        this.cols = this.columns.map(x => x.key);
        this.key = this.module_name;
        this.sortColumn = '';
        this.sortDirection = 'desc';
        this.Mainmodule = this;
        this.agentId = this.record?.agentid;
        // this.productId = this.record?.product_id;
        this.productId = this.record?.id;

        this.entityService.onrefreshInstallmentCalll().pipe(takeUntil(this._unsubscribeAll)).subscribe({
            next: (item) => {
                if(item){
                    if(this.recordId){
                        this.refreshItemsNew();
                    }
                }
            }
        })
    }

    ngOnInit(): void {
        // this.refreshItems();
        setTimeout(() => {
        }, 3000);
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
                // this.dataList = res[0];
                this.installmentDetail = res.installments;
                //this.dataList = res?.data[0];
            },
            error: (err) => {
                this.alertService.showToast('error', err, 'top-right', true);
                this.isLoading = false;
            },
        });
    }

    getPaymentIndicatorClass(isPaymentAaudited: boolean): string {
        if (isPaymentAaudited == true) {
            return 'bg-green-600';
        } else {
            return 'bg-red-600';
        }
    }

    getNodataText(): string {
        if (this.isLoading)
            return 'Loading...';
        else if (this.searchInputControl.value)
            return `no search results found for \'${this.searchInputControl.value}\'.`;
        else return 'No data to display';
    }

    editAction(record): void {
        this.entityService.raiserInstallmentCall({data: record, edit: true});
    }
}
