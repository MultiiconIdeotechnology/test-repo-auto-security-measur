import { NgIf, NgFor, DatePipe, CommonModule, NgClass } from '@angular/common';
import { Component, OnDestroy, ViewChild } from '@angular/core';
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
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { dateRange } from 'app/common/const';
import { Security, filter_module_name, messages, module_name } from 'app/security';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';
import { DateTime } from 'luxon';
import { Excel } from 'app/utils/export/excel';
import { SalesReturnFilterComponent } from './sales-return-filter/sales-return-filter.component';
import { SalesReturnService } from 'app/services/sales-return.service';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { KycDocumentService } from 'app/services/kyc-document.service';
import { AgentService } from 'app/services/agent.service';
import { cloneDeep } from 'lodash';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

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
        PrimeNgImportsModule
    ],
    templateUrl: './sales-return.component.html'
})
export class SalesReturnComponent extends BaseListingComponent implements OnDestroy {

    module_name = module_name.SalesReturn;
    filter_table_name = filter_module_name.sales_return;
    private settingsUpdatedSubscription: Subscription;

    columns = [
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

    loading: boolean = true;
    data: any[] = []
    total: any;
    currentFilter: any;
    downloading: boolean = false;
    @ViewChild(MatDatepickerToggle) toggle: MatDatepickerToggle<Date>;
    searchInternalFilter = new FormControl('');
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
    supplierList: any[] = [];
    agentList: any[] = [];
    tempData: any[] = [];
    isFilterShow: boolean = false;
    dataList = [];
    sortColumn: any = 'complete_date_time';
    selectedAgent: any;
    selectedSupplier: any;

    constructor(
        private salesReturnService: SalesReturnService,
        private kycDocumentService: KycDocumentService,
        public agentService: AgentService,
        private _matdialog: MatDialog,
        public _filterService: CommonFilterService
    ) {
        super(module_name.SalesReturn);
        this._filterService.applyDefaultFilter(this.filter_table_name);
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
        this.getSupplier("")
        this.agentList = this._filterService.agentListByValue;

        // common filter
        this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
            this.selectedAgent = resp['table_config']['agent']?.value;
            this.selectedSupplier = resp['table_config']['supplier']?.value;

            if (this.selectedAgent && this.selectedAgent.id) {
				const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
				if (!match) {
					this.agentList.push(this.selectedAgent);
				}
			}
            // this.sortColumn = resp['sortColumn'];
            // this.primengTable['_sortField'] = resp['sortColumn'];
            if (resp['table_config']['complete_date_time'].value) {
                resp['table_config']['complete_date_time'].value = new Date(resp['table_config']['complete_date_time'].value);
            }
            if (typeof (resp['table_config']['agent'].value) == 'object') {
				resp['table_config']['agent'].value = resp['table_config']['agent'].value?.agency_name;
			}
            if (typeof (resp['table_config']['supplier'].value) == 'object') {
				resp['table_config']['supplier'].value = resp['table_config']['supplier'].value?.company_name;
			}
            this.primengTable['filters'] = resp['table_config'];
            this.isFilterShow = true;
            this.primengTable._filter();
        });
    }

    ngAfterViewInit() {
        // Defult Active filter show
        if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
            this.isFilterShow = true;
            let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
            this.selectedAgent = filterData['table_config']['agent']?.value;
            this.selectedSupplier = filterData['table_config']['supplier']?.value;
            
            if (this.selectedAgent && this.selectedAgent.id) {
				const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
				if (!match) {
					this.agentList.push(this.selectedAgent);
				}
			}

            if (filterData['table_config']['complete_date_time'].value) {
                filterData['table_config']['complete_date_time'].value = new Date(filterData['table_config']['complete_date_time'].value);
            }
            if (typeof (filterData['table_config']['agent'].value) == 'object') {
				filterData['table_config']['agent'].value = filterData['table_config']['agent'].value?.agency_name;
			}
            if (typeof (filterData['table_config']['supplier'].value) == 'object') {
				filterData['table_config']['supplier'].value = filterData['table_config']['supplier'].value?.company_name;
			}
            // this.primengTable['_sortField'] = filterData['sortColumn'];
            // this.sortColumn = filterData['sortColumn'];
            this.primengTable['filters'] = filterData['table_config'];
        }
    }

    getAgent(value: string) {
        this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
            this.agentList = data;

            for (let i in this.agentList) {
                this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`;
                this.agentList[i].id_by_value = this.agentList[i].agency_name;
            }
        })
    }

    onAgentChange(agent: any) {
		if (agent) {
			this.primengTable.filter(agent?.agency_name, 'agent', 'equals');
			setTimeout(() => {
				this.primengTable.filters['agent']['value'] = agent;
			},  this.primengTable.filterDelay);
		} else {
			this.primengTable.filter(null, 'agent', 'equals');
			this.primengTable.filters['agent'] = { value: null, matchMode: 'equals' };
		}
	}

    onSupplierChange(supplier: any) {
		if (supplier) {
			this.primengTable.filter(supplier?.company_name, 'supplier', 'equals');
			setTimeout(() => {
				this.primengTable.filters['supplier']['value'] = supplier;
			},  this.primengTable.filterDelay);
		} else {
			this.primengTable.filter(null, 'supplier', 'equals');
			this.primengTable.filters['supplier'] = { value: null, matchMode: 'equals' };
		}
	}

    filterModal() {
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

    getFilter(): any {
        const filterReq = {};
        filterReq['from_date'] = DateTime.fromJSDate(this.saleFilter.FromDate).toFormat('yyyy-MM-dd');
        filterReq['to_date'] = DateTime.fromJSDate(this.saleFilter.ToDate).toFormat('yyyy-MM-dd');
        filterReq['service'] = this.saleFilter?.service || 'All';
        filterReq['agent_id'] = this.saleFilter?.agent_id?.id || 'All';
        filterReq['billing_company_id'] = this.saleFilter?.billing_company_id.company_id || 'All';
        filterReq['date'] = this.saleFilter.date || 'Last Month';
        filterReq['columeFilters'] = {};
        return filterReq;
    }

    refreshItems(event?: any): void {
        this.loading = true;
        let extraModel = this.getFilter();
        let newModel = this.getNewFilterReq(event)
        var model = { ...newModel, ...extraModel };

        this.salesReturnService.getSalesReturnReport(model).subscribe({
            next: (res) => {
                this.dataList = res?.data;
                for (let i in this.dataList) {
                    this.dataList[i]['complete_date_time'] = new Date(this.dataList[i]['complete_date_time']);
                }
                this.totalRecords = res?.total;
                this.loading = false;
            }, error: err => {
                this.alertService.showToast('error', err);
                this.loading = false;
            },
        });
    }

    getSupplier(value: string) {
        this.kycDocumentService.getSupplierCombo(value, 'Airline').subscribe((data) => {
            this.supplierList = data;
        });
    }

    // ngAfterViewInit(): void {
    //     // this.dataSource.paginator = this._paginator;
    //     // this.dataSource.sort = this._sort;
    //     this.searchInternalFilter.valueChanges.subscribe((value: any) => {
    //             this.dataList.filter = value
    //         });
    // }

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

        // const filterReq = {};
        // filterReq['service'] = this.saleFilter?.service || 'All';
        // filterReq['date'] = this.saleFilter.date || 'Last Month';
        // filterReq['agent_id'] = this.saleFilter?.agent_id?.id || 'All';
        // filterReq['billing_company_id'] = this.saleFilter?.billing_company_id.id || 'All';
        // filterReq['from_date'] = DateTime.fromJSDate(this.saleFilter.FromDate).toFormat('yyyy-MM-dd');
        // filterReq['to_date'] = DateTime.fromJSDate(this.saleFilter.ToDate).toFormat('yyyy-MM-dd');

        // this.salesReturnService.getSalesReturnReport(filterReq).subscribe(data => {
        let salesData = this.primengTable['_value'] || [];
        this.tempData = cloneDeep(salesData);

        for (var dt of this.tempData) {
            //   dt.complete_date_time = DateTime.fromISO(dt.complete_date_time).toFormat('dd-MM-yyyy HH:mm');
            dt.complete_date_time = new DatePipe('en-US').transform(dt.complete_date_time, 'dd-MM-yyyy HH:mm');
        }

        Excel.export(
            'Sales Return',
            [
                { header: 'Agent', property: 'agent' },
                { header: 'Supplier', property: 'supplier' },
                { header: 'Return Date Time', property: 'complete_date_time' },
                { header: 'Amendment Ref No', property: 'amendment_ref_no' },
                { header: 'Air Ref No', property: 'air_ref_no' },
                { header: 'Amendment Type', property: 'amendment_type' },
                { header: 'Pan Number', property: 'pan_numner' },
                { header: 'GST Number', property: 'gst_numner' },
                { header: 'Sup Service Charge', property: 'sup_service_charge' },
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
            this.tempData, "Sales Return", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 40 } }]);
        // });
    }

  // Custom date range filter function
  customDateRangeFilter(value: any, filter: any): boolean {
    if (!filter || !value) {
      return true;
    }

    const [startDate, endDate] = filter.value;
    const dateValue = new Date(value).getTime();

    return dateValue >= startDate.getTime() && dateValue <= endDate.getTime();
  }

  // onDateRangeChangeInternal function
  onDateRangeChangeInternal(dateRange: Date[], filter: Function) {
    if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      filter({
        value: [startDate, endDate],
        matchMode: 'custom'
      });
    } else {
      filter(null);
    }
  }

    ngOnDestroy(): void {

        if (this.settingsUpdatedSubscription) {
            this.settingsUpdatedSubscription.unsubscribe();
            this._filterService.activeFiltData = {};
        }
    }
}
