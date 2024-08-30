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
import { SaleBookService } from 'app/services/sale-book.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject } from 'rxjs';
import { SaleFilterComponent } from './sale-filter/sale-filter.component';
import { DateTime } from 'luxon';
import { Excel } from 'app/utils/export/excel';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { AgentService } from 'app/services/agent.service';
import { FlightTabService } from 'app/services/flight-tab.service';
import { PspSettingService } from 'app/services/psp-setting.service';
import { cloneDeep } from 'lodash';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
	selector: 'app-sale-book',
	templateUrl: './sale-book.component.html',
	styleUrls: ['./sale-book.component.scss'],
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
})
export class SaleBookComponent extends BaseListingComponent implements OnDestroy {
	@ViewChild('datatable') public primengTable: Table;

	module_name = module_name.SaleBook;
	filter_table_name = filter_module_name.sale_book;
	private settingsUpdatedSubscription: Subscription;

	loading: boolean = true;
	supplierList: any[] = [];
	companyList: any[] = [];
	selectedCompany: any;
	selectedSupplier: any;
	selectedAgent: any;
	agentList: any[] = [];
	isFilterShow: boolean = false;
	data: any[] = []
	total: any;
	currentFilter: any;
	downloading: boolean = false;
	searchInternalFilter = new FormControl();
	saleFilter: any;
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
	tempData: any[] = [];
	dataList = [];
	sortColumn: any = 'inquiry_date';
	filterConfig = {}


	dateBy = [{ value: 'BookingDate', label: 'Booking Date' }, { value: 'InvoiceDate', label: 'Invoice Date' }, { value: 'TravelDate', label: 'Travel Date' }];
	ServicesBy = [{ value: 'Airline', label: 'Airline' }, { value: 'Hotel', label: 'Hotel' }, { value: 'Bus', label: 'Bus' }, { value: 'Visa', label: 'Visa' }];
	// companyBy = [{value:'BONTON HOLIDAYS PVT. LTD.', label:'BONTON HOLIDAYS PVT. LTD.'},{value:'BONTON TOURS & TRAVELS DMCC', label:'BONTON TOURS & TRAVELS DMCC'}];


	constructor(
		private SalebookService: SaleBookService,
		public agentService: AgentService,
		private _matdialog: MatDialog,
		private flighttabService: FlightTabService,
		private pspsettingService: PspSettingService,
		public _filterService: CommonFilterService,
	) {
		super(module_name.SaleBook);
		this._filterService.applyDefaultFilter(this.filter_table_name);
		this.saleFilter = {
			filter_date_by: '',
			service: '',
			agent_id: '',
			date: '',
			billing_company_id: '',
			FromDate: new Date(),
			ToDate: new Date(),
			supplier_id: [{
				"id": "all",
				"company_name": "All"
			}],
		};
		this.saleFilter.FromDate.setDate(1);
		this.saleFilter.FromDate.setMonth(this.saleFilter.FromDate.getMonth());
	}

	ngOnInit() {
		this.refreshItems();
		this.getSupplier("")
		this.getAgent('');
		this.getCompanyList("");

		// common filter
		this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
			this.selectedAgent = resp['table_config']['master_agent']?.value;
			if (this.selectedAgent && this.selectedAgent.id) {
				const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
				if (!match) {
					this.agentList.push(this.selectedAgent);
				}
			}

			this.selectedSupplier = resp['table_config']['supplier']?.value;
			this.selectedCompany = resp['table_config']['billing_company']?.value;
			// this.sortColumn = resp['sortColumn'];
			// this.primengTable['_sortField'] = resp['sortColumn'];
			if (resp['table_config']['booking_date'].value) {
				resp['table_config']['booking_date'].value = new Date(resp['table_config']['booking_date'].value);
			}
			if (resp['table_config']['travel_date'].value) {
				resp['table_config']['travel_date'].value = new Date(resp['table_config']['travel_date'].value);
			}
			if (resp['table_config']['inquiry_date'].value) {
				resp['table_config']['inquiry_date'].value = new Date(resp['table_config']['inquiry_date'].value);
			}
			if (resp['table_config']['invoice_date'].value) {
				resp['table_config']['invoice_date'].value = new Date(resp['table_config']['invoice_date'].value);
			}
			if (typeof (resp['table_config']['master_agent'].value) == 'object') {
				resp['table_config']['master_agent'].value = resp['table_config']['master_agent'].value?.agency_name;
			}
			if (typeof (resp['table_config']['supplier'].value) == 'object') {
				resp['table_config']['supplier'].value = resp['table_config']['supplier'].value?.company_name;
			}
			if (typeof (resp['table_config']['billing_company'].value) == 'object') {
				resp['table_config']['billing_company'].value = resp['table_config']['billing_company'].value?.company_name;
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
			this.selectedAgent = filterData['table_config']['master_agent']?.value;
			this.selectedSupplier = filterData['table_config']['supplier']?.value;
			this.selectedCompany = filterData['table_config']['billing_company']?.value;

			if (filterData['table_config']['booking_date'].value) {
				filterData['table_config']['booking_date'].value = new Date(filterData['table_config']['booking_date'].value);
			}
			if (filterData['table_config']['travel_date'].value) {
				filterData['table_config']['travel_date'].value = new Date(filterData['table_config']['travel_date'].value);
			}
			if (filterData['table_config']['inquiry_date'].value) {
				filterData['table_config']['inquiry_date'].value = new Date(filterData['table_config']['inquiry_date'].value);
			}
			if (filterData['table_config']['invoice_date'].value) {
				filterData['table_config']['invoice_date'].value = new Date(filterData['table_config']['invoice_date'].value);
			}
			if (typeof (filterData['table_config']['master_agent'].value) == 'object') {
				filterData['table_config']['master_agent'].value = filterData['table_config']['master_agent'].value?.agency_name;
			}
			if (typeof (filterData['table_config']['supplier'].value) == 'object') {
				filterData['table_config']['supplier'].value = filterData['table_config']['supplier'].value?.company_name;
			}
			if (typeof (filterData['table_config']['billing_company'].value) == 'object') {
				filterData['table_config']['billing_company'].value = filterData['table_config']['billing_company'].value?.company_name;
			}
			// this.primengTable['_sortField'] = filterData['sortColumn'];
			// this.sortColumn = filterData['sortColumn'];

			this.primengTable['filters'] = filterData['table_config'];
		}
	}

	getAgent(value: string) {
		this.agentService.getAgentComboMaster(value, true).subscribe((data) => {
			this.agentList = data;

			if (this.selectedAgent && this.selectedAgent.id) {
				const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
				if (!match) {
					this.agentList.push(this.selectedAgent);
				}
			}

			for (let i in this.agentList) {
				this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}${this.agentList[i].email_address}`;
				this.agentList[i].id_by_value = this.agentList[i].agency_name;
			}
		})
	}

	getCompanyList(value) {
		this.pspsettingService.getCompanyCombo(value).subscribe((data) => {
			this.companyList = data;

			for (let i in this.companyList) {
				this.companyList[i].id_by_value = this.companyList[i].company_name;
			}
		})
	}

	// this.pspsettingService.getCompanyCombo(value)

	getSupplier(value) {
		this.flighttabService.getSupplierBoCombo(value).subscribe((data: any) => {
			this.supplierList = data;

			for (let i in this.supplierList) {
				this.supplierList[i].id_by_value = this.supplierList[i].company_name;
			}
		})
	}

	onAgentChange(agent: any) {
		if (agent) {
			this.primengTable.filter(agent?.agency_name, 'master_agent', 'equals');
			setTimeout(() => {
				this.primengTable.filters['master_agent']['value'] = agent;
			}, this.primengTable.filterDelay);
		} else {
			this.primengTable.filter(null, 'master_agent', 'equals');
			this.primengTable.filters['master_agent'] = { value: null, matchMode: 'equals' };
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

	onBillingComChange(billingCompany:any){
		if (billingCompany) {
			this.primengTable.filter(billingCompany?.company_name, 'billing_company', 'equals');
			setTimeout(() => {
				this.primengTable.filters['billing_company']['value'] = billingCompany;
			},  this.primengTable.filterDelay);
		} else {
			this.primengTable.filter(null, 'billing_company', 'equals');
			this.primengTable.filters['billing_company'] = { value: null, matchMode: 'equals' };
		}
	}

	filterModal() {
		this._matdialog
			.open(SaleFilterComponent, {
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
		let filterReq = {}
		filterReq['filter_date_by'] = this.saleFilter?.filter_date_by || 'BookingDate';
		filterReq['service'] = this.saleFilter?.service || 'All';
		filterReq['date'] = this.saleFilter.date || 'Last Month';
		filterReq['agent_id'] = this.saleFilter?.agent_id?.id || 'All';
		filterReq['billing_company_id'] = this.saleFilter?.billing_company_id.company_id || 'All';
		filterReq['from_date'] = DateTime.fromJSDate(this.saleFilter.FromDate).toFormat('yyyy-MM-dd');
		filterReq['to_date'] = DateTime.fromJSDate(this.saleFilter.ToDate).toFormat('yyyy-MM-dd');
		filterReq['supplier_id'] = this.saleFilter?.supplier_id?.map(x => x.id).join(',') == 'all' ? 'All' : this.saleFilter?.supplier_id?.map(x => x.id).join(',');
		filterReq['columeFilters'] = {};
		return filterReq;
	}

	refreshItems(event?: any): void {
		this.loading = true;

		// const filterReq = {};
		// filterReq['filter_date_by'] = this.saleFilter?.filter_date_by || 'BookingDate';
		// filterReq['service'] = this.saleFilter?.service || 'All';
		// filterReq['date'] = this.saleFilter.date || 'Last Month';
		// filterReq['agent_id'] = this.saleFilter?.agent_id?.id || 'All';
		// filterReq['billing_company_id'] = this.saleFilter?.billing_company_id.company_id || 'All';
		// filterReq['from_date'] = DateTime.fromJSDate(this.saleFilter.FromDate).toFormat('yyyy-MM-dd');
		// filterReq['to_date'] = DateTime.fromJSDate(this.saleFilter.ToDate).toFormat('yyyy-MM-dd');
		// filterReq['supplier_id'] = this.saleFilter?.supplier_id?.map(x => x.id).join(',') == 'all' ? 'All' : this.saleFilter?.supplier_id?.map(x => x.id).join(',');
		let extraModel = this.getFilter();
		let newModel = this.getNewFilterReq(event)
		var model = { ...newModel, ...extraModel };

		this.SalebookService.getSalesBookReport(model).subscribe({
			next: (res) => {
				this.dataList = res?.data;
				for (let i in this.dataList) {
					this.dataList[i]['inquiry_date'] = new Date(this.dataList[i]['inquiry_date']);
					this.dataList[i]['invoice_date'] = new Date(this.dataList[i]['invoice_date']);
					if (this.dataList[i]['travel_date']) {
						this.dataList[i]['travel_date'] = new Date(this.dataList[i]['travel_date']);
					}

					this.dataList[i]['booking_date'] = new Date(this.dataList[i]['booking_date']);
				}
				this.totalRecords = res?.total;
				this.loading = false;
			}, error: err => {
				this.alertService.showToast('error', err);
				this.loading = false;
			},
		});
	}

	//   ngAfterViewInit(): void {
	//     this.dataSource.paginator = this._paginator;
	//     this.dataSource.sort = this._sort;
	//     this.searchInternalFilter.valueChanges
	//       .subscribe((value) => {
	//         this.dataSource.filter = value
	//       });
	//   }

	getNodataText(): string {
		if (this.loading)
			return 'Loading...';
		else if (this.searchInternalFilter.value)
			return `no search results found for \'${this.searchInternalFilter.value}\'.`;
		else return 'No data to display';
	}

	exportExcel(): void {
		if (!Security.hasExportDataPermission('Sale Book')) {
			return this.alertService.showToast('error', messages.permissionDenied);
		}

		// const filterReq = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value);
		// const req = Object.assign(filterReq);

		// req.skip = 0;
		// req.take = this._paginator.length;
		// const filterReq = {};
		// filterReq['filter_date_by'] = this.saleFilter?.filter_date_by || 'BookingDate';
		// filterReq['service'] = this.saleFilter?.service || 'All';
		// filterReq['date'] = this.saleFilter.date || 'Last Month';
		// filterReq['agent_id'] = this.saleFilter?.agent_id?.id || 'All';
		// filterReq['billing_company_id'] = this.saleFilter?.billing_company_id.company_id || 'All';
		// filterReq['from_date'] = DateTime.fromJSDate(this.saleFilter.FromDate).toFormat('yyyy-MM-dd');
		// filterReq['to_date'] = DateTime.fromJSDate(this.saleFilter.ToDate).toFormat('yyyy-MM-dd');
		// filterReq['supplier_id'] = this.saleFilter?.supplier_id?.map(x => x.id).join(',') == 'all' ? 'All' : this.saleFilter?.supplier_id?.map(x => x.id).join(',');

		// this.SalebookService.getSalesBookReport(filterReq).subscribe(data => {
		//   for (var dt of data?.data) {
		//     // dt.datetime = DateTime.fromISO(dt.datetime).toFormat('dd-MM-yyyy hh:mm a')
		//   }
		// this.tempData = cloneDeep(this.dataList);
		let salesData = this.primengTable['_value'] || [];
		this.tempData = cloneDeep(salesData);
		for (var dt of this.tempData) {
			// dt.datetime = DateTime.fromISO(dt.datetime).toFormat('dd-MM-yyyy HH:mm');
			dt.inquiry_date = new DatePipe('en-US').transform(dt.inquiry_date, 'dd-MM-yyyy HH:mm');
			dt.invoice_date = new DatePipe('en-US').transform(dt.invoice_date, 'dd-MM-yyyy HH:mm');
			if (dt.travel_date) {
				dt.travel_date = new DatePipe('en-US').transform(dt.travel_date, 'dd-MM-yyyy HH:mm');
			}
			dt.booking_date = new DatePipe('en-US').transform(dt.booking_date, 'dd-MM-yyyy HH:mm');
		}


		Excel.export(
			'Sale Book',
			[
				{ header: 'Agent Code', property: 'agent_code' },
				{ header: 'Agent', property: 'master_agent' },
				{ header: 'Service Type', property: 'service_type' },
				{ header: 'Sales Type', property: 'sales_type' },
				{ header: 'Agent Pan No.', property: 'agent_pan_no' },
				{ header: 'Agent GST No.', property: 'agent_gst_no' },
				{ header: 'Agent Pincode', property: 'agent_pincode' },
				{ header: 'Agent State', property: 'agent_state' },
				{ header: 'Booking Date', property: 'booking_date' },
				{ header: 'Travel Date', property: 'travel_date' },
				{ header: 'Inquiry / Completed Date', property: 'inquiry_date' },
				{ header: 'Invoice Date', property: 'invoice_date' },
				{ header: 'Invoice No.', property: 'invoice_no' },
				{ header: 'Destination', property: 'destination' },
				{ header: 'Pax', property: 'pax' },
				{ header: 'Booking Reference No.', property: 'booking_ref_no' },
				{ header: 'PNR', property: 'pnr' },
				{ header: 'GDS PNR', property: 'gds_pnr' },
				{ header: 'Purchase Amount', property: 'purchase_amount' },
				{ header: 'Commission Income', property: 'commission_income' },
				{ header: 'TDS On Commission Income', property: 'tds_on_commission_income' },
				{ header: 'Net Purchase', property: 'net_purchase' },
				{ header: 'Service Charge', property: 'service_charge' },
				{ header: 'Service Charge Tax', property: 'service_charge_tax' },
				{ header: 'SGST', property: 'sgst' },
				{ header: 'CGST', property: 'cgst' },
				{ header: 'IGST', property: 'igst' },
				{ header: 'Commission Passed On', property: 'commission_passedon' },
				{ header: 'TDS On Commission Passed On', property: 'tds_on_commission_passedon' },
				{ header: 'Sale Price', property: 'sale_price' },
				{ header: 'Commission Given', property: 'commission_given' },
				{ header: 'TDS On Commission Given', property: 'tds_on_commission_given' },
				{ header: 'Booking Currency', property: 'booking_currency' },
				{ header: 'ROE', property: 'roe' },
				{ header: 'Billing Company', property: 'billing_company' },
				{ header: 'Supplier', property: 'supplier' },
				{ header: 'GST Number Passed To Supplier', property: 'gst_number_passed_to_supplier' },
				{ header: 'Travel Type', property: 'travel_type' },
				{ header: 'Ticket Status', property: 'ticket_status' },
				{ header: 'Booking Type', property: 'booking_type' },
				{ header: 'Supplier Invoice Number', property: 'supplier_invoice_number' },
				{ header: 'Payment Mode', property: 'payment_mode' },
			],
			this.tempData, "Sale Book", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 40 } }]);
		// });
	}

	getStatusColor(status: string): string {
		if (status == 'Assign To Refund') {
			return 'text-orange-600';
		} else if (status == 'Confirmed') {
			return 'text-green-600';
		} else if (status == 'Partially Cancelled' || status == 'Cancelled') {
			return 'text-red-600';
		} else {
			return '';
		}
	}

	ngOnDestroy(): void {

		if (this.settingsUpdatedSubscription) {
			this.settingsUpdatedSubscription.unsubscribe();
			this._filterService.activeFiltData = {};
		}
	}
}
