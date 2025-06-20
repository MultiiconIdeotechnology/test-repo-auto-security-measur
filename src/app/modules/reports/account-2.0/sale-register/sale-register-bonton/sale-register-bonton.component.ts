import { filter_module_name, messages, module_name, Security } from 'app/security';
import { Component, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseListingComponent, Column } from 'app/form-models/base-listing';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { AppConfig } from 'app/config/app-config';
import { AccountService } from 'app/services/account.service';
import { Excel } from 'app/utils/export/excel';
import { DateTime } from 'luxon';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { SidebarCustomModalService } from 'app/services/sidebar-custom-modal.service';
import { SupplierService } from 'app/services/supplier.service';
import { Linq } from 'app/utils/linq';
import { EntityService } from 'app/services/entity.service';
import { Router } from '@angular/router';
import { AgentService } from 'app/services/agent.service';
import { CurrencyService } from 'app/services/currency.service';

@Component({
  selector: 'app-sale-register-bonton',
  standalone: true,
  imports: [
    DatePipe,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatMenuModule,
    MatDialogModule,
    MatDividerModule,
    FormsModule,
    PrimeNgImportsModule,
    MatTooltipModule,
    MatSelectModule,
  ],
  templateUrl: './sale-register-bonton.component.html',
  styleUrls: ['./sale-register-bonton.component.scss']
})
export class SaleRegisterBontonComponent extends BaseListingComponent implements OnDestroy {
  @Input() isFilterShow: boolean = false;
  @Output() isFilterShowEvent = new EventEmitter(false);
  @Input() startDate: any;
  @Input() endDate: any;
  @Input() supplierList: any = [];
  @Input() lastSearchString = '';
  // module_name = module_name.products_collection;
  filter_table_name = filter_module_name.purchase_register_bonton;
  private settingsUpdatedSubscription: Subscription;
  isLoading = false;
  dataList = [];
  employeeList: any = [];
  // supplierList: any[] = [];
  selectedSupplier: any;
  destroy$: any = new Subject();
  isSomeLiveInvoiceFalse: boolean = false;
  customScrollH: any = this.scrollHeightWTab;
  agentList: any[] = [];
  currencyList: any[] = [];
  selectedAgent: any;

  serviceTypeList: any[] = ['Airline', 'Air Amendment', 'Bus', 'Hotel', 'Visa', 'Insurance', 'Holiday', 'Forex', 'Cab', 'Bus Amendment'];

  actionList: any[] = [
    { label: 'Yes', value: false },
    { label: 'No', value: true },
  ]

  tableFieldArr: any[] = [
    { field: 'invoice_date', header: 'Date', type: 'custom', matchMode: 'custom' },
    { field: 'code', header: 'Code', type: 'numeric', matchMode: 'equals' },
    { field: 'name', header: 'Name', type: 'select', matchMode: 'contains' },
    { field: 'gsT_No', header: 'GST No.', type: 'text', matchMode: 'contains' },
    { field: 'state', header: 'State', type: 'text', matchMode: 'contains' },
    { field: 'invoice_No', header: 'Invoice No', type: 'text', matchMode: 'contains' },
    { field: 'ref_No', header: 'Ref. No', type: 'text', matchMode: 'contains' },
    { field: 'pnr', header: 'PNR', type: 'text', matchMode: 'contains' },
    { field: 'gdS_PNR', header: 'GDS PNR', type: 'text', matchMode: 'contains' },
    { field: 'currency', header: 'Currency', type: 'select', matchMode: 'contains' },
    { field: 'roe', header: 'ROE', type: 'numeric', matchMode: 'equals' },
    { field: 'base_Fare', header: 'Base Fare', type: 'numeric', matchMode: 'equals' },
    { field: 'airline_Tax', header: 'Airline Tax', type: 'numeric', matchMode: 'equals' },
    { field: 'service_Charge', header: 'Service charge', type: 'numeric', matchMode: 'equals' },
    { field: 'cgst', header: 'CGST', type: 'numeric', matchMode: 'equals' },
    { field: 'sgst', header: 'SGST', type: 'numeric', matchMode: 'equals' },
    { field: 'igst', header: 'IGST', type: 'numeric', matchMode: 'equals' },
    { field: 'total_Sale', header: 'Total Sale', type: 'numeric', matchMode: 'equals' },
    { field: 'pan', header: 'PAN', type: 'text', matchMode: 'contains' },
    { field: 'commission_Passed_On', header: 'Commission Passed on', type: 'numeric', matchMode: 'equals' },
    { field: 'tdS_On_CP', header: 'TDS on CP', type: 'numeric', matchMode: 'equals' },
    { field: 'net_Receivable', header: 'Net Receivable', type: 'numeric', matchMode: 'equals' },
    { field: 'commission_Given', header: 'Commission Given', type: 'numeric', matchMode: 'equals' },
    { field: 'tdS_On_CG', header: 'TDS on CG', type: 'numeric', matchMode: 'equals' },
    { field: 'cashback', header: 'Cashback', type: 'numeric', matchMode: 'equals' },
    { field: 'tdS_On_CB', header: 'TDS on CB', type: 'numeric', matchMode: 'equals' },
    { field: 'service_Type', header: 'Service Type', type: 'static-select', matchMode: 'contains' },
    { field: 'sales_Type', header: 'Sales Type', type: 'text', matchMode: 'contains' },
    { field: 'booking_Date', header: 'Booking Date', type: 'custom', matchMode: 'custom' },
    { field: 'travel_Date', header: 'Travel Date', type: 'custom', matchMode: 'custom' },
    { field: 'gsT_No_Passed_To_Supplier', header: 'GST No Passed to Supplier', type: 'text', matchMode: 'contains' },
    { field: 'travel_Type', header: 'Travel Type', type: 'text', matchMode: 'contains' },
    { field: 'booking_Type', header: 'Booking Type', type: 'text', matchMode: 'contains' }
  ];


  constructor(
    private accountService: AccountService,
    private agentService: AgentService,
    public _filterService: CommonFilterService,
    private entityService: EntityService,
    private currencyService: CurrencyService,
    private router: Router,
  ) {
    super(module_name.products_collection);

    this.sortColumn = 'invoice_date';
    this._filterService.applyDefaultFilter(this.filter_table_name);

  }

  getCustomHeight() {
    this.customScrollH = (window.innerHeight - 200) + 'px';
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.getCustomHeight();
  }

  ngOnInit(): void {
    this.getCustomHeight();

    this._filterService.agentList$.subscribe((res: any) => {
      this.agentList = res;
    });

    this.getCurrencyList();
    // common filter
    this.startSubscription();

    // this.sidebarDialogService.onModalChange().pipe((takeUntil(this.destroy$))).subscribe((res: any) => {
    //   if (res && res.key == 'manager-service-status') {
    //     let index = this.dataList.findIndex((item: any) => (item.service_For == res.data?.service_For && item.service_For_IdStr == res?.data?.service_For_Id));
    //     if (index != -1) {
    //       this.dataList[index]['is_live_invoice'] = true;
    //     }
    //   }
    // })
  }

  ngAfterViewInit() {
    // Defult Active filter show
    this._filterService.updateSelectedOption('');
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      this.isFilterShow = true;
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      this.selectedAgent = filterData['table_config']['name']?.value;
      if (this.selectedAgent && this.selectedAgent.id) {
        const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
        if (!match) {
          this.agentList.push(this.selectedAgent);
        }
      }
      this.restoreDateFilter('invoice_date', filterData['table_config']);
      this.restoreDateFilter('booking_Date', filterData['table_config']);
      this.restoreDateFilter('travel_date', filterData['table_config']);
      this.isFilterShowEvent.emit(true);
      this.primengTable['filters'] = filterData['table_config'];
    }
  }

  onOptionClick(option: any, primengTable: any, field: string) {
    const value = option?.id_by_value ?? '';
    const current = this.selectionMap();
    this.selectionMap.set({ ...current, [field]: value });

    if (value && value !== 'custom_date_range') {
      primengTable.filter(option, field, 'custom');
    }
  }


  // Currency List api
  getCurrencyList() {
    this.currencyService.getCurrencyComboCashed().subscribe((data) => {
      this.currencyList = data;

      for (let i in this.currencyList) {
        this.currencyList[i].id_by_value = this.currencyList[i].currency_short_code;
      }
    })
  }

  viewData(element: any): void {
    // if (!Security.hasViewDetailPermission(module_name.bookingsFlight)) {
    //     return this.alertService.showToast(
    //         'error',
    //         messages.permissionDenied
    //     );
    // }

    if (element?.ref_No) {
      const refPrefix = element.ref_No.slice(0, 3);

      switch (refPrefix) {
        case "FLT":
          Linq.recirect(`/booking/flight/details/${element.service_For_IdStr}`);
          break;
        case "BUS":
          Linq.recirect(`/booking/bus/details/${element.service_For_IdStr}`);
          break;
        case "VIS":
          Linq.recirect(`/booking/visa/details/${element.service_For_IdStr}`);
          break;
        case "INS":
          Linq.recirect(`/booking/insurance/details/${element.service_For_IdStr}`);
          break;
        case "AIR":
          this.entityService.raiseAmendmentInfoCall({ data: { ...element, id: element.service_For_IdStr } });
          break;
        case "HTL":
          Linq.recirect(`/booking/hotel/details/${element.service_For_IdStr}`);
          break;
        case "PKG":
          Linq.recirect(`/booking/holiday-lead/details/${element.service_For_IdStr}`);
          break;
        case "AGI":
          Linq.recirect(`/booking/group-inquiry/details/${element.service_For_IdStr}`);
          break;
        case "OSB":
          Linq.recirect(`/booking/offline-service/entry/${element.service_For_IdStr}/readonly`);
          break;
        case "FRX":
          this.router.navigate(['/booking/forex'])
          setTimeout(() => {
            this.entityService.raiseForexEntityCall({ data: element.service_For_IdStr, global_withdraw: true })
          }, 300);
          break;
        case "CAB":
          Linq.recirect(`/booking/cab/details/${element.service_For_IdStr}`);
          break;
        // case "PL":
        //   Linq.recirect(`/booking/holiday-lead/details/${element.booking_id}`);
        //   break;
        default:
          console.warn("Unknown refNo prefix:", refPrefix);
      }
    }
  }

  refreshItems(event?: any): void {
    this.isLoading = true;
    let payload = this.getNewFilterReq(event);
    payload['Filter'] = this.lastSearchString['bontonFilter'];
    payload['fromDate'] = DateTime.fromJSDate(new Date(this.startDate.value)).toFormat('yyyy-MM-dd');
    payload['toDate'] = DateTime.fromJSDate(new Date(this.endDate.value)).toFormat('yyyy-MM-dd');

    this.accountService.getBontonSaleRegister(payload).subscribe({
      next: (data) => {
        this.dataList = data.data;
        this.totalRecords = data.total;
        this.isSomeLiveInvoiceFalse = this.dataList.some((item: any) => !item.is_live_invoice)
        // this.totalsObj = data.totals || 0;
        this.isLoading = false;
        if (this.dataList && this.dataList.length) {
          setTimeout(() => {
            // this.isFrozenColumn('', ['index', 'payment_attachment',]);
          }, 200);
        }
      },
      error: (err) => {
        this.alertService.showToast('error', err);
        this.isLoading = false;
      },
    });
  }

  onFrozenColumn(field: any, event: MouseEvent) {
    if (field == 'invoice_date' || field == 'code') {
      this.isFrozenColumn(field);
      event.stopPropagation();
    }
  }

  exportExcel(): void {
    // if (!Security.hasExportDataPermission(this.module_name)) {
    //     return this.alertService.showToast(
    //         'error',
    //         messages.permissionDenied
    //     );
    // }

    const filterReq = this.getNewFilterReq({});

    filterReq['Filter'] = this.lastSearchString['bontonFilter'];
    filterReq['Take'] = this.totalRecords;
    filterReq['fromDate'] = DateTime.fromJSDate(new Date(this.startDate.value)).toFormat('yyyy-MM-dd');
    filterReq['toDate'] = DateTime.fromJSDate(new Date(this.endDate.value)).toFormat('yyyy-MM-dd');


    this.accountService.getBontonPurchaseRegister(filterReq).subscribe((data) => {
      for (var dt of data.data) {
        dt.date = dt.date ? DateTime.fromISO(dt.date).toFormat('dd-MM-yyyy HH:mm:ss') : '';
      }

      Excel.export(
        'Purchase Register(Bonton)',
        [
          { header: 'Date', property: 'date' },
          { header: 'Name', property: 'supplier_Name' },
          { header: 'Invoice No', property: 'invoive_No' },
          { header: 'Supplier. Ref. No', property: 'supplier_Ref_No' },
          { header: 'Ref. No', property: 'ref_No' },
          { header: 'PNR', property: 'pnr' },
          { header: 'Base Fare', property: 'base_Fare' },
          { header: 'Airline Tax', property: 'airline_Tax' },
          { header: 'Service charge', property: 'service_Charge' },
          { header: 'CGST', property: 'cgst' },
          { header: 'SGST', property: 'sgst' },
          { header: 'IGST', property: 'igst' },
          { header: 'Total Purchase', property: 'total_Purchase' },
          { header: 'Commission Income', property: 'purchase_Commission' },
          { header: 'TDS', property: 'purchase_TDS' },
          { header: 'Net Payable', property: 'net_Payable' },
        ],
        data.data,
        'Purchase Register(Bonton)',
        [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }]
      );
    });
  }

  // function to get the Agent list from api
  getAgent(value: string, bool = true) {
    this.agentService.getAgentComboMaster(value, bool).subscribe((data) => {
      this.agentList = data;

      for (let i in this.agentList) {
        this.agentList[i]['agent_info'] = `${this.agentList[i].code}-${this.agentList[i].agency_name}-${this.agentList[i].email_address}`;
        this.agentList[i].id_by_value = this.agentList[i].agency_name;
      }
    })
  }

  getNodataText(): string {
    if (this.isLoading) return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  startSubscription() {
    if (!this.settingsUpdatedSubscription || this.settingsUpdatedSubscription.closed) {
      this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp: any) => {
        this.selectedAgent = resp['table_config']['name']?.value;
        if (this.selectedAgent && this.selectedAgent.id) {
          const match = this.agentList.find((item: any) => item.id == this.selectedAgent?.id);
          if (!match) {
            this.agentList.push(this.selectedAgent);
          }
        }
        this.restoreDateFilter('invoice_date', resp['table_config']);
        this.restoreDateFilter('booking_Date', resp['table_config']);
        this.restoreDateFilter('travel_date', resp['table_config']);

        this.primengTable['filters'] = resp['table_config'];
        this.isFilterShow = true;
        this.primengTable._filter();
      });
    }
  }

  stopSubscription() {
    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this.settingsUpdatedSubscription = undefined;
    }
  }

  ngOnDestroy(): void {
    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }

    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
