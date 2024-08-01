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
import { AppConfig } from 'app/config/app-config';
import { Security, messages, module_name } from 'app/security';
import { SaleBookService } from 'app/services/sale-book.service';
import { ToasterService } from 'app/services/toaster.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { SaleFilterComponent } from './sale-filter/sale-filter.component';
import { DateTime } from 'luxon';
import { Excel } from 'app/utils/export/excel';
import { cloneDeep } from 'lodash';

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

  ],
})
export class SaleBookComponent {

  columns = ['action',
    'agent_code',
    'master_agent',
    'service_type',
    'sales_type',
    'agent_pan_no',
    'agent_gst_no',
    'agent_pincode',
    'agent_state',
    'booking_date',
    'travel_date',
    'inquiry_date',
    'invoice_date',
    'invoice_no',
    'destination',
    'pax',
    'booking_ref_no',
    'pnr',
    'gds_pnr',
    'purchase_amount',
    'commission_income',
    'tds_on_commission_income',
    'net_purchase',
    'service_charge',
    'service_charge_tax',
    'sgst',
    'cgst',
    'igst',
    'commission_passedon',
    'tds_on_commission_passedon',
    'sale_price',
    'commission_given',
    'tds_on_commission_given',
    'booking_currency',
    'roe',
    'billing_company',
    'supplier',
    'gst_number_passed_to_supplier',
    'travel_type',
    'ticket_status',
    'booking_type',
    'supplier_invoice_number',
    'payment_mode'
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

  module_name = module_name.SaleBook
  tempData: any[] = [];


  constructor(
    private alertService: ToasterService,
    private SalebookService: SaleBookService,
    private confirmService: FuseConfirmationService,
    private _matdialog: MatDialog,
  ) {

    this.saleFilter = {
      filter_date_by: '',
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

  // getFilter(): any {
  //   const filterReq = {};
  //   filterReq['filter_date_by'] = this.saleFilter?.filter_date_by;
  //   filterReq['service'] = this.saleFilter?.service;
  //   filterReq['agent_id'] = this.saleFilter?.agent_id?.id || 'All';
  //   filterReq['billing_company_id'] = this.saleFilter?.billing_company_id.id || 'All';
  //   filterReq['from_date'] = DateTime.fromJSDate(this.saleFilter.FromDate).toFormat('yyyy-MM-dd');
  //   filterReq['to_date'] = DateTime.fromJSDate(this.saleFilter.ToDate).toFormat('yyyy-MM-dd');
  //   return filterReq;
  // }

  refreshItems(): void {
    this.loading = true;

    const filterReq = {};
    filterReq['filter_date_by'] = this.saleFilter?.filter_date_by || 'BookingDate';
    filterReq['service'] = this.saleFilter?.service || 'All';
    filterReq['date'] = this.saleFilter.date || 'Last Month';
    filterReq['agent_id'] = this.saleFilter?.agent_id?.id || 'All';
    filterReq['billing_company_id'] = this.saleFilter?.billing_company_id.id || 'All';
    filterReq['from_date'] = DateTime.fromJSDate(this.saleFilter.FromDate).toFormat('yyyy-MM-dd');
    filterReq['to_date'] = DateTime.fromJSDate(this.saleFilter.ToDate).toFormat('yyyy-MM-dd');

    this.SalebookService.getSalesBookReport(filterReq).subscribe({
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
    if (!Security.hasExportDataPermission('Sale Book')) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    // const filterReq = GridUtils.GetFilterReq(this._paginator, this._sort, this.searchInputControl.value);
    // const req = Object.assign(filterReq);

    // req.skip = 0;
    // req.take = this._paginator.length;
    const filterReq = {};
    filterReq['filter_date_by'] = this.saleFilter?.filter_date_by || 'BookingDate';
    filterReq['service'] = this.saleFilter?.service || 'All';
    filterReq['date'] = this.saleFilter.date || 'Last Month';
    filterReq['agent_id'] = this.saleFilter?.agent_id?.id || 'All';
    filterReq['billing_company_id'] = this.saleFilter?.billing_company_id.id || 'All';
    filterReq['from_date'] = DateTime.fromJSDate(this.saleFilter.FromDate).toFormat('yyyy-MM-dd');
    filterReq['to_date'] = DateTime.fromJSDate(this.saleFilter.ToDate).toFormat('yyyy-MM-dd');

    this.SalebookService.getSalesBookReport(filterReq).subscribe(data => {
      for (var dt of data) {
        // dt.datetime = DateTime.fromISO(dt.datetime).toFormat('dd-MM-yyyy hh:mm a')
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
          { header: 'Inquiry Date', property: 'inquiry_date' },
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
          { header: 'Commission Passedon', property: 'commission_passedon' },
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
        data, "Sale Book", [{ s: { r: 0, c: 0 }, e: { r: 0, c: 40 } }]);
    });
  }


 
}
