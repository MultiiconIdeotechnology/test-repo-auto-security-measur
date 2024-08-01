import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
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
import { PaymentEntryComponent } from './payment-entry/payment-entry.component';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styles: [`
  .tbl-grid {
    grid-template-columns: 40px 240px 200px 100px 250px 150px 150px 100px 150px 180px;
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
export class PaymentComponent extends BaseListingComponent {

  @ViewChild('tabGroup') tabGroup;
  @ViewChild(MatPaginator) public _paginatorPending: MatPaginator;
  @ViewChild(MatSort) public _sortPending: MatSort;
  @Input() id: string;
  @Input() agent_currency_id: string
  @Input() isInvoiceGenerated: boolean;

  module_name = module_name.OsbPayment
  dataList = [];
  total = 0;
  appConfig = AppConfig;
  pendingFilter: any = {};
  record: any = {};

  public key: any;
  public sortColumn: any;
  public sortDirection: any;
  Mainmodule: any;
  isLoading = false;
  public _unsubscribeAll: Subject<any> = new Subject<any>();

  columns = [
    { key: 'transaction_ref_no', name: 'Transaction ID', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: true, is_boolean: false, tooltip: true, isview: true },
    { key: 'payment_ref_no', name: 'Ref no.', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'payment_status', name: 'Status', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', is_sticky: false, indicator: false, is_boolean: false, tooltip: true, iscolor: true },
    { key: 'payment_to', name: 'To', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    // { key: 'service_for', name: 'For', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'payment_amount', name: 'Net Sale Amount', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, isamount: true },
    { key: 'mode_of_payment', name: 'Mode of Payment', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'roe', name: 'ROE', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'payment_request_date', name: 'Requested', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'audit_date_time', name: 'Audited', is_date: true, date_formate: 'dd-MM-yyyy HH:mm:ss', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
  ]
  cols = [];

  constructor(
    private conformationService: FuseConfirmationService,
    private offlineService: OfflineserviceService,
    private matDialog: MatDialog,
  ) {
    super(module_name.OsbPayment)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'payment_request_date';
    this.sortDirection = 'desc';
    this.Mainmodule = this
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

    this.offlineService.getOsbPaymentList(this.getFilter()).subscribe(
      {
        next: data => {
          this.isLoading = false;
          data.data.forEach(x => {
            x.audit_date_time = x.payment_status == "Confirmed" ? x.audit_date_time : '';
            x.payment_amount = x.supplier_currency + " " + x.payment_amount;
          });

          this.dataList = data.data;

          this._paginatorPending.length = data.total;
          this.total = data.total;
        }, error: err => {
          this.alertService.showToast('error', err);

          this.isLoading = false;
        }
      }
    );
  }

  viewInternal(record): void {
    this.matDialog.open(PaymentEntryComponent, {
      data: { data: record, readonly: true },
      disableClose: true
    })
  }

  createInternal(): void {
    this.matDialog.open(PaymentEntryComponent,
      {
        data: { Obs_id: this.id, agent_currency_id: this.agent_currency_id },
        disableClose: true
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.alertService.showToast(
            'success',
            'New record added',
            'top-right',
            true
          );
          this.refreshItems();
        }
      });
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

}
