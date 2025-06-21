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
import { CurrencyService } from 'app/services/currency.service';
import { AgentService } from 'app/services/agent.service';

@Component({
  selector: 'app-sale-register-dmcc',
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
  templateUrl: './sale-register-dmcc.component.html',
  styleUrls: ['./sale-register-dmcc.component.scss']
})
export class SaleRegisterDmccComponent extends BaseListingComponent
  implements OnDestroy {
  // module_name = module_name.purchaseRegister;
  @Input() isFilterShow: boolean = false;
  @Output() isFilterShowEvent = new EventEmitter(false);
  @Input() startDate: any;
  @Input() endDate: any;
  @Input() supplierList: any = [];
  @Input() lastSearchString = '';
  // module_name = module_name.products_collection;
  filter_table_name = filter_module_name.purchase_register_bonton_dmcc;
  private settingsUpdatedSubscription: Subscription;
  isLoading = false;
  dataList = [];
  employeeList: any = [];
  selectedSupplier: any;
  destroy$: any = new Subject();
  selectedCurrency: any;
  customScrollH: any;
  agentList: any[] = [];
  currencyList: any[] = [];
  selectedAgent: any;

  tableFieldArr: any[] = [
    { field: 'invoice_date', header: 'Date', type: 'custom', matchMode: 'custom' },
    { field: 'code', header: 'Agent ID', type: 'numeric', matchMode: 'equals' },
    { field: 'name', header: 'Agent Name', type: 'select', matchMode: 'contains' },
    { field: 'vaT_No', header: 'VAT No', type: 'numeric', matchMode: 'equals' },
    { field: 'invoice_No', header: 'Invoice No', type: 'text', matchMode: 'contains' },
    { field: 'ref_No', header: 'Ref. No', type: 'text', matchMode: 'contains' },
    { field: 'pnr', header: 'PNR', type: 'text', matchMode: 'contains' },
    { field: 'gdS_PNR', header: 'GDS PNR', type: 'text', matchMode: 'contains' },
    { field: 'currency', header: 'Currency', type: 'select', matchMode: 'contains' },
    { field: 'roe', header: 'ROE', type: 'numeric', matchMode: 'equals', isNotFixed: true },
    { field: 'base_Fare', header: 'Base Fare', type: 'numeric', matchMode: 'equals' },
    { field: 'service_Charge', header: 'Service charge', type: 'numeric', matchMode: 'equals' },
    { field: 'tax', header: 'TAX', type: 'numeric', matchMode: 'equals' },
    { field: 'total_Sale', header: 'Total Purchase', type: 'numeric', matchMode: 'equals' },
    { field: 'discount', header: 'Discount', type: 'numeric', matchMode: 'equals' }
  ];

  constructor(
    private accountService: AccountService,
    private supplierService: SupplierService,
    public _filterService: CommonFilterService,
    private agentService: AgentService,
    private entityService: EntityService,
    private currencyService: CurrencyService,
    private router: Router,
  ) {
    super(module_name.products_collection);

    this.sortColumn = 'invoice_date';
    this._filterService.applyDefaultFilter(this.filter_table_name);

  }

  ngOnInit(): void {
    this.getCustomHeight();

    this.getCurrencyList();

    this._filterService.agentList$.subscribe((res: any) => {
      this.agentList = res;
    });

    // common filter
    this.startSubscription();

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
      this.isFilterShowEvent.emit(true);
      this.primengTable['filters'] = filterData['table_config'];
    }
  }

  getCustomHeight() {
    this.customScrollH = (window.innerHeight - 208) + 'px';
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.getCustomHeight();
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
    payload['Filter'] = this.lastSearchString['dmccFilter'];
    payload['fromDate'] = DateTime.fromJSDate(new Date(this.startDate.value)).toFormat('yyyy-MM-dd');
    payload['toDate'] = DateTime.fromJSDate(new Date(this.endDate.value)).toFormat('yyyy-MM-dd');

    this.accountService.getSaleRegisterDMCCReport(payload).subscribe({
      next: (data) => {
        this.dataList = data.data;
        this.totalRecords = data.total;
        // this.totalsObj = data.totals || 0;
        this.isLoading = false;
        // if (this.dataList && this.dataList.length) {
        //   setTimeout(() => {
        //     this.isFrozenColumn('', ['invoice_date', 'code',]);
        //   }, 200);
        // }
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

  // Currency List api
  getCurrencyList() {
    this.currencyService.getCurrencyComboCashed().subscribe((data) => {
      this.currencyList = data;

      for (let i in this.currencyList) {
        this.currencyList[i].id_by_value = this.currencyList[i].currency_short_code;
      }
    })
  }

  exportExcel(): void {
    // if (!Security.hasExportDataPermission(this.module_name)) {
    //     return this.alertService.showToast(
    //         'error',
    //         messages.permissionDenied
    //     );
    // }

    const filterReq = this.getNewFilterReq({});

    filterReq['Filter'] = this.lastSearchString['dmccFilter'];
    filterReq['Take'] = this.totalRecords;
    filterReq['fromDate'] = DateTime.fromJSDate(new Date(this.startDate.value)).toFormat('yyyy-MM-dd HH:mm:ss');
    filterReq['toDate'] = DateTime.fromJSDate(new Date(this.endDate.value)).toFormat('yyyy-MM-dd');


    this.accountService.getSaleRegisterDMCCReport(filterReq).subscribe((data) => {
      for (var dt of data.data) {
        dt.invoice_date = dt.invoice_date ? DateTime.fromISO(dt.invoice_date).toFormat('dd-MM-yyyy HH:mm:ss') : '';
      }

      Excel.export(
        'Sale Register (DMCC)',
        [
          { header: 'Date', property: 'invoice_date'},
          { header: 'Agent ID', property: 'code'},
          { header: 'Agent Name', property: 'name'},
          { header: 'VAT No', property: 'vaT_No'},
          { header: 'Invoice No', property: 'invoice_No'},
          { header: 'Ref. No', property: 'ref_No'},
          { header: 'PNR', property: 'pnr'},
          { header: 'GDS PNR', property: 'gdS_PNR'},
          { header: 'Currency', property: 'currency'},
          { header: 'ROE', property: 'roe'},
          { header: 'Base Fare', property: 'base_Fare'},
          { header: 'Service charge', property: 'service_Charge'},
          { header: 'TAX', property: 'tax'},
          { header: 'Total Purchase', property: 'total_Sale'},
          { header: 'Discount', property: 'discount'}
        ],
        data.data,
        'Sale Register (DMCC)',
        [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }]
      );
    });
  }

  getSupplier(value: string) {
    this.supplierService.getSupplierCombo(value, '').subscribe((data) => {
      this.supplierList = data;

      for (let i in this.supplierList) {
        this.supplierList[i].id_by_value = this.supplierList[i].company_name;
      }
    });
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

  onOptionClick(option: any, primengTable: any, field: string) {
    const value = option?.id_by_value ?? '';
    const current = this.selectionMap();
    this.selectionMap.set({ ...current, [field]: value });

    if (value && value !== 'custom_date_range') {
      primengTable.filter(option, field, 'custom');
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
