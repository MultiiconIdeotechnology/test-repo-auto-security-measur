import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AppConfig } from 'app/config/app-config';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { module_name } from 'app/security';
import { OfflineserviceService } from 'app/services/offlineservice.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { Subject } from 'rxjs';
import { InvoiceEntryComponent } from './invoice-entry/invoice-entry.component';
import { DateTime } from 'luxon';
import { FlightTabService } from 'app/services/flight-tab.service';
import { CommonUtils } from 'app/utils/commonutils';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styles: [`
  .tbl-grid {
    grid-template-columns: 50px 200px 180px 100px 120px 120px 120px 150px 100px 100px 100px 100px 150px 150px;
  }
  `],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    CommonModule,
    MatTabsModule
  ],
})
export class InvoiceComponent extends BaseListingComponent {

  @ViewChild('tabGroup') tabGroup;
  @ViewChild(MatSort) public _sortPending: MatSort;
  @Input() id: string;
  @Input() agent_currency_id: string
  @Input() isInvoiceGenerated: boolean;
  @Input() data: any;
  @Output() updateInvoiceGenerat = new EventEmitter<any>();

  module_name = module_name.OsbInvoice
  dataList = [];
  appConfig = AppConfig;
  pendingFilter: any = {};
  record: any = {};
  disableBtn = false;

  public key: any;
  public sortColumn: any;
  public sortDirection: any;
  Mainmodule: any;
  isLoading = false;
  public _unsubscribeAll: Subject<any> = new Subject<any>();

  columns = [
    { key: 'invoice', name: 'Invoive', is_invoive: true, is_date: false, date_formate: '', is_sortable: false, class: '', is_sticky: false, is_boolean: false, tooltip: true },
    { key: 'invoive_no', name: 'Invoive No', is_date: false, date_formate: '', is_sortable: false, class: '', is_sticky: false, is_boolean: false, tooltip: true },
    { key: 'invoice_date', name: 'Invoice Date', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: false, class: '', is_sticky: false, is_boolean: false, tooltip: false },
    { key: 'currency_short_code', name: 'Currency', is_date: false, date_formate: '', is_sortable: false, class: 'header-center-view', is_sticky: false, is_boolean: false, tooltip: true },
    { key: 'service_fee', name: 'Service Fee', is_date: false, date_formate: '', is_sortable: false, class: 'header-right-view', is_sticky: false, is_boolean: false, tooltip: true, iscolor: true },
    { key: 'psp_charge', name: 'PSP Charge', is_date: false, date_formate: '', is_sortable: false, class: 'header-right-view', is_sticky: false, is_boolean: false, tooltip: true },
    { key: 'commission', name: 'Commission', is_date: false, date_formate: '', is_sortable: false, class: 'header-right-view', is_sticky: false, is_boolean: false, tooltip: false, isamount: true },
    { key: 'cancellation_charge', name: 'Cancellation Charge', is_date: false, date_formate: '', is_sortable: false, class: 'header-right-view', is_sticky: false, is_boolean: false, tooltip: true },
    { key: 'sgst', name: 'SGST', is_date: false, date_formate: '', is_sortable: false, class: 'header-center-view', is_sticky: false, is_boolean: false, tooltip: true },
    { key: 'cgst', name: 'CGST', is_date: false, date_formate: '', is_sortable: false, class: 'header-center-view', is_sticky: false, is_boolean: false, tooltip: true },
    { key: 'igst', name: 'IGST', is_date: false, date_formate: '', is_sortable: false, class: 'header-center-view', is_sticky: false, is_boolean: false, tooltip: true },
    { key: 'tds', name: 'TDS', is_date: false, date_formate: '', is_sortable: false, class: 'header-center-view', is_sticky: false, is_boolean: false, tooltip: true },
    { key: 'total_amount', name: 'Total Amount', is_date: false, date_formate: '', is_sortable: false, class: 'header-right-view', is_sticky: false, is_boolean: false, tooltip: true },
    { key: 'grand_total', name: 'Grand Total', is_date: false, date_formate: '', is_sortable: false, class: 'header-right-view', is_sticky: false, is_boolean: false, tooltip: true },
  ]
  cols = [];

  constructor(
    private conformationService: FuseConfirmationService,
    private offlineService: OfflineserviceService,
    private flighttabService: FlightTabService,
    private matDialog: MatDialog,
  ) {
    super(module_name.OsbInvoice)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'payment_request_date';
    this.sortDirection = 'desc';
    this.Mainmodule = this
  }

  ngOnInit(): void {
    this.refreshItems();
  }

  getFilter(): any {
    const filterReq = GridUtils.GetFilterReq(
      this._paginator,
      this._sort,
      this.searchInputControl.value
    );
    filterReq['OsbId'] = this.id
    return filterReq;
  }

  refreshItems() {
    this.isLoading = true;

    this.offlineService.getOsbInvoice(this.getFilter()).subscribe(
      {
        next: data => {
          this.isLoading = false;
          data.data.forEach(x => {
            x.service_fee = x.service_fee.toString();
            x.psp_charge = x.psp_charge.toString();
            x.commission = x.commission.toString();
            x.cancellation_charge = x.cancellation_charge.toString();
            x.sgst = x.sgst.toString();
            x.cgst = x.cgst.toString();
            x.igst = x.igst.toString();
            x.tds = x.tds.toString();
            x.total_amount = x.total_amount.toString();
            x.grand_total = x.grand_total.toString();
          });

          this.dataList = data.data;

        }, error: err => {
          this.alertService.showToast('error', err);

          this.isLoading = false;
        }
      }
    );
  }

  invoice(record): void {
    this.flighttabService.Invoice(record.id).subscribe({
      next: (res) => {
        CommonUtils.downloadPdf(res.data, 'invoice.pdf');
      }, error: (err) => {
        this.alertService.showToast('error', err)
      }
    })
  }

  viewInternal(record): void {
    this.matDialog.open(InvoiceEntryComponent, {
      data: { data: record, readonly: true },
      disableClose: true
    })
  }

  createInternal(): void {
    this.disableBtn = true;
    var json: any = { osb_id: this.id };

    const label: string = 'Generate invoice'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + '?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.offlineService.createInvoiceEntry(json).subscribe({
          next: () => {
            this.updateInvoiceGenerat.emit();
            this.data.find(x => x.name == "Status").value = "Completed";
            this.data.find(x => x.name == "Invoice Generate Date").value = DateTime.fromJSDate(new Date()).toFormat('dd-MM-yyyy HH:mm:ss');
            this.alertService.showToast('success', 'Invoice generate successfully', 'top-right', true);
            this.refreshItems();
            this.disableBtn = false;
          }, error: (err) => {
            this.alertService.showToast('error', err, "top-right", true);
            this.disableBtn = false;
          }
        })
      } else
        this.disableBtn = false;
    })
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

}