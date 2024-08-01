import { NgIf, NgFor, DatePipe, CommonModule, NgClass } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { dateRange } from 'app/common/const';
import { Security, messages, module_name } from 'app/security';
import { ToasterService } from 'app/services/toaster.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';
import { DateTime } from 'luxon';
import { Excel } from 'app/utils/export/excel';
import { SalesReturnFilterComponent } from './sales-return-filter/sales-return-filter.component';
import { SalesReturnService } from 'app/services/sales-return.service';

@Component({
    selector: 'app-sales-return',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatInputModule,
        MatButtonModule,
        MatTooltipModule,
        NgClass,
        RouterOutlet,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        NgxMatSelectSearchModule,
    ],
    templateUrl: './sales-return.component.html'
})
export class SalesReturnComponent {
    columns = ['action',
        'agent',
        'supplier',
        'complete_date_time',
        'amendment_ref_no',
        'amendment_type',
        'air_ref_no',
        'pan_numner',
        'gst_numner',
        'sup_service_charge',
        'bonton_service_charge',
        'refunded_amount',
        'service_charge',
        'tax',
        'net_refund',
        'commission',
        'tds',
        'refundable_price',
        'commission_2',
        'tds_2',
        'net_commission',
    ];
    dataSource = new MatTableDataSource();
    loading: boolean = true;

    data: any[] = []
    total: any;
    currentFilter: any;
    downloading: boolean = false;
    @ViewChild(MatDatepickerToggle) toggle: MatDatepickerToggle<Date>;

    searchInternalFilter = new FormControl();

    saleFilter: any;


    @ViewChild(MatPaginator) public _paginator: MatPaginator;
    @ViewChild(MatSort) public _sort: MatSort;
    searchInputControl = new FormControl('');
    public _unsubscribeAll: Subject<any> = new Subject<any>();
    status = new FormControl('');
    DR = dateRange;
    public date = new FormControl();
    public startDate = new FormControl();
    public endDate = new FormControl();
    public StartDate: any;
    public EndDate: any;
    public dateRanges = [];

    module_name = module_name.SalesReturn
    tempData: any[] = [];


    constructor(
        private alertService: ToasterService,
        private salesReturnService: SalesReturnService,
        private confirmService: FuseConfirmationService,
        private _matdialog: MatDialog,
    ) {

        this.saleFilter = {
            service: '',
            agent_id: '',
            date: '',
            billing_company_id: '',
            FromDate: new Date(),
            ToDate: new Date(),
        };

        this.saleFilter.FromDate.setDate(1);
        this.saleFilter.FromDate.setMonth(this.saleFilter.FromDate.getMonth());

    }

    ngOnInit() {
        this.refreshItems();
    }

    filter() {
        this._matdialog
            .open(SalesReturnFilterComponent, {
                data: this.saleFilter,
                disableClose: true,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res) {
                    this.saleFilter = res;
                    this.refreshItems();
                }
            });
    }

    refreshItems(): void {
        this.loading = true;

        const filterReq = {};
        filterReq['from_date'] = DateTime.fromJSDate(this.saleFilter.FromDate).toFormat('yyyy-MM-dd');
        filterReq['to_date'] = DateTime.fromJSDate(this.saleFilter.ToDate).toFormat('yyyy-MM-dd');
        filterReq['service'] = this.saleFilter?.service || 'All';
        filterReq['agent_id'] = this.saleFilter?.agent_id?.id || 'All';
        filterReq['billing_company_id'] = this.saleFilter?.billing_company_id.id || 'All';
        filterReq['date'] = this.saleFilter.date || 'Last Month';

        this.salesReturnService.getSalesReturnReport(filterReq).subscribe({
            next: (res) => {
                this.dataSource.data = res;
                this._paginator.length = res.total;
                this.loading = false;
            }, error: err => {
                this.alertService.showToast('error', err);
                this.loading = false;
            },
        });
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this._paginator;
        this.dataSource.sort = this._sort;
        this.searchInternalFilter.valueChanges
            .subscribe((value) => {
                this.dataSource.filter = value
            });
    }

    getNodataText(): string {
        if (this.loading)
            return 'Loading...';
        else if (this.searchInternalFilter.value)
            return `no search results found for \'${this.searchInternalFilter.value}\'.`;
        else return 'No data to display';
    }

    exportExcel(): void {
        if (!Security.hasExportDataPermission(module_name.SalesReturn)) {
            return this.alertService.showToast('error', messages.permissionDenied);
        }

        const filterReq = {};
        filterReq['service'] = this.saleFilter?.service || 'All';
        filterReq['date'] = this.saleFilter.date || 'Last Month';
        filterReq['agent_id'] = this.saleFilter?.agent_id?.id || 'All';
        filterReq['billing_company_id'] = this.saleFilter?.billing_company_id.id || 'All';
        filterReq['from_date'] = DateTime.fromJSDate(this.saleFilter.FromDate).toFormat('yyyy-MM-dd');
        filterReq['to_date'] = DateTime.fromJSDate(this.saleFilter.ToDate).toFormat('yyyy-MM-dd');

        this.salesReturnService.getSalesReturnReport(filterReq).subscribe(data => {
            Excel.export(
                'Sales Return',
                [
                    { header: 'Agent', property: 'agent' },
                    { header: 'Supplier', property: 'supplier' },
                    { header: 'Return Date time', property: 'complete_date_time' },
                    { header: 'Amendment Ref No', property: 'amendment_ref_no' },
                    { header: 'Air Ref No', property: 'air_ref_no' },
                    { header: 'Amendment type', property: 'amendment_type' },
                    { header: 'Pan Number', property: 'pan_numner' },
                    { header: 'GST Numner', property: 'gst_numner' },
                    { header: 'Sup Service Charge.', property: 'sup_service_charge' },
                    { header: 'Bonton Service Charge', property: 'bonton_service_charge' },
                    { header: 'CGST', property: 'refunded_amount' },
                    { header: 'Service Charge', property: 'service_charge' },
                    { header: 'TAX', property: 'tax' },
                    { header: 'Net Refund', property: 'net_refund' },
                    { header: 'Commission', property: 'commission' },
                    { header: 'TDS', property: 'tds' },
                    { header: 'Refundable Price', property: 'refundable_price' },
                    { header: 'Commission 2', property: 'commission_2' },
                    { header: 'TDS 2', property: 'tds_2' },
                    { header: 'Net Commission', property: 'net_commission' }
                ],
                data, "Sales Return", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 40 } }]);
        });
    }

}
