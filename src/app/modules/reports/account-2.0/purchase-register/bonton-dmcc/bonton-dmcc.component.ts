import { filter_module_name, messages, module_name, Security } from 'app/security';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
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


@Component({
  selector: 'app-bonton-dmcc',
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
  templateUrl: './bonton-dmcc.component.html',
  styleUrls: ['./bonton-dmcc.component.scss']
})
export class BontonDmccComponent extends BaseListingComponent
  implements OnDestroy {
  // module_name = module_name.purchaseRegister;
  @Input() isFilterShow: boolean = false;
  @Output() isFilterShowEvent = new EventEmitter(false);
  @Input() startDate: any;
  @Input() endDate: any;
  @Input() supplierList: any = [];
  // module_name = module_name.products_collection;
  filter_table_name = filter_module_name.purchase_register_bonton_dmcc;
  private settingsUpdatedSubscription: Subscription;
  isLoading = false;
  dataList = [];
  employeeList: any = [];
  selectedSupplier: any;
  destroy$: any = new Subject();
  currencyList: any[] = [];
  selectedCurrency: any;

  tableFieldArr: any[] = [
    { field: 'date', header: 'Date', type: 'custom', matchMode: 'custom' },
    { field: 'name', header: 'Name', type: 'select', matchMode: 'contains' },
    { field: 'invoiceNo', header: 'Invoice No', type: 'text', matchMode: 'contains' },
    { field: 'refNo', header: 'Ref. No', type: 'text', matchMode: 'contains' },
    { field: 'pnr', header: 'PNR', type: 'text', matchMode: 'contains' },
    { field: 'currency', header: 'Currency', type: 'select', matchMode: 'contains' },
    { field: 'roe', header: 'ROE', type: 'numeric', matchMode: 'equals', },
    { field: 'baseFare', header: 'Base Fare', type: 'numeric', matchMode: 'equals', },
    { field: 'serviceCharge', header: 'Service charge', type: 'numeric', matchMode: 'equals' },
    { field: 'tax', header: 'TAX', type: 'numeric', matchMode: 'equals' },
    { field: 'totalPurchase', header: 'Total Purchase', type: 'numeric', matchMode: 'equals' },
    { field: 'discount', header: 'Discount', type: 'numeric', matchMode: 'equals' }
  ];

  constructor(
    private accountService: AccountService,
    private supplierService: SupplierService,
    public _filterService: CommonFilterService,
    private sidebarDialogService: SidebarCustomModalService,
    private entityService: EntityService,
    private currencyService: CurrencyService,
    private router: Router,
  ) {
    super(module_name.products_collection);

    this.sortColumn = 'date';
    this._filterService.applyDefaultFilter(this.filter_table_name);

  }

  ngOnInit(): void {
    this.getCurrencyList();

    // common filter
    this.startSubscription();

    this.sidebarDialogService.onModalChange().pipe((takeUntil(this.destroy$))).subscribe((res: any) => {
      if (res && res.key == 'manager-service-status') {
        let index = this.dataList.findIndex((item: any) => (item.service_For == res.data?.service_For && item.service_For_Id == res?.data?.service_For_Id));
        if (index != -1) {
          this.dataList[index]['is_live_invoice'] = true;
        }
      }
    })
  }

  ngAfterViewInit() {
    // Defult Active filter show
    this._filterService.updateSelectedOption('');
    if (this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      this.isFilterShow = true;
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      console.log("filterData", filterData)
      if (filterData['table_config']['date']?.value && Array.isArray(filterData['table_config']['date']?.value)) {
        this._filterService.updateSelectedOption('custom_date_range');
        this._filterService.rangeDateConvert(filterData['table_config']['date']);
      }
      this.isFilterShowEvent.emit(true);
      this.primengTable['filters'] = filterData['table_config'];
    }
  }


  manageService(record: any) {
    this.sidebarDialogService.openModal('purchase-manage-service-fee', record)
  }

  viewData(element:any): void {
    // if (!Security.hasViewDetailPermission(module_name.bookingsFlight)) {
    //     return this.alertService.showToast(
    //         'error',
    //         messages.permissionDenied
    //     );
    // }

   if (element?.refNo) {
      const refPrefix = element.refNo.slice(0, 3);
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
          this.entityService.raiseAmendmentInfoCall({ data: {...element, id:element.service_For_IdStr} });
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
    console.log("startDate", this.startDate.value);
    payload['fromDate'] = DateTime.fromJSDate(new Date(this.startDate.value)).toFormat('yyyy-MM-dd');
    payload['toDate'] = DateTime.fromJSDate(new Date(this.endDate.value)).toFormat('yyyy-MM-dd');

    this.accountService.getPurchaseRegisterDMCCReport(payload).subscribe({
      next: (data) => {
        this.dataList = data.data;
        this.totalRecords = data.total;
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
    if (field == 'date' || field == 'name') {
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

    filterReq['Filter'] = this.searchInputControl.value;
    filterReq['Take'] = this.totalRecords;
    filterReq['fromDate'] = DateTime.fromJSDate(new Date(this.startDate.value)).toFormat('yyyy-MM-dd');
    filterReq['toDate'] = DateTime.fromJSDate(new Date(this.endDate.value)).toFormat('yyyy-MM-dd');


    this.accountService.getPurchaseRegisterDMCCReport(filterReq).subscribe((data) => {
      for (var dt of data.data) {
        dt.date = dt.date ? DateTime.fromISO(dt.date).toFormat('dd-MM-yyyy') : '';
      }

      Excel.export(
        'Purchase Register(DMCC)',
        [
          { header: 'Date', property: 'date'},
          { header: 'Name', property: 'name'},
          { header: 'Invoice No', property: 'invoiceNo'},
          { header: 'Ref. No', property: 'refNo'},
          { header: 'PNR', property: 'pnr'},
          { header: 'Currency', property: 'currency'},
          { header: 'ROE', property: 'roe'},
          { header: 'Base Fare', property: 'baseFare'},
          { header: 'Service charge', property: 'serviceCharge'},
          { header: 'TAX', property: 'tax'},
          { header: 'Total Purchase', property: 'totalPurchase'},
          { header: 'Discount', property: 'discount' }
        ],
        data.data,
        'Purchase Register(DMCC)',
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
        console.log("resp", resp.table_config)
      this.selectedCurrency = resp['table_config']['currency'].value || {};
        this._filterService.updateSelectedOption('');
        if (resp['table_config']['date']?.value && Array.isArray(resp['table_config']['date']?.value)) {
          this._filterService.selectionDateDropdown = 'custom_date_range';
          this._filterService.updateSelectedOption('custom_date_range');
          this._filterService.rangeDateConvert(resp['table_config']['date']);
        }

        console.log('this.primengTable filters', this.primengTable.filters)

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
