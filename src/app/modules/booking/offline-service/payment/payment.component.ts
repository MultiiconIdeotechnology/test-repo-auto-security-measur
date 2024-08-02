import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
import { AccountService } from 'app/services/account.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styles: [`
  .tbl-grid {
    grid-template-columns: 40px 180px 120px 150px 120px 110px 140px;
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
  @ViewChild(MatSort) public _sortPending: MatSort;
  @Input() id: string;
  @Input() agent_currency_id: string
  @Input() isInvoiceGenerated: boolean;

  module_name = module_name.OsbPayment
  dataList = [];
  AlldataList = [];
  appConfig = AppConfig;
  pendingFilter: any = {};
  record: any = {};
  mysearchInputControl = new FormControl('');

  public key: any;
  public sortColumn: any;
  public sortDirection: any;
  Mainmodule: any;
  isLoading = false;
  public _unsubscribeAll: Subject<any> = new Subject<any>();

  columns = [
    { key: 'payment_ref_no', name: 'Reference No.', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'payment_status', name: 'Status', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, iscolor: true },
    { key: 'payment_to_name', name: 'Supplier', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: true, is_boolean: false, tooltip: true, isview: true },
    { key: 'supplier_amount', name: 'Amount', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, isamount: true },
    { key: 'roe', name: 'ROE', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'payment_request_date', name: 'Entry Date', is_date: true, date_formate: 'dd-MM-yyyy HH:mm', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
  ]
  cols = [];

  constructor(
    private conformationService: FuseConfirmationService,
    private offlineService: OfflineserviceService,
    private accountService: AccountService,
    private matDialog: MatDialog,
  ) {
    super(module_name.OsbPayment)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'payment_request_date';
    this.sortDirection = 'desc';
    this.Mainmodule = this
  }

  ngOnInit(): void {
    this.mysearchInputControl.valueChanges.subscribe(val => {
      if (!val || val.trim() == '')
        this.dataList = this.AlldataList
      else
        this.dataList = this.AlldataList.filter(x => x.payment_ref_no.toLowerCase().includes(val.toLowerCase()) || x.payment_status.toLowerCase().includes(val.toLowerCase()) ||
          x.payment_to_name.toLowerCase().includes(val.toLowerCase()) || x.supplier_amount.toString().toLowerCase().includes(val.toLowerCase())
          || x.payment_request_date.toString().toLowerCase().includes(val.toLowerCase()) || x.roe.toString().toLowerCase().includes(val.toLowerCase()))
    })

    this.refreshItems();
  }

  shortData() {
    this.dataList.sort((a, b) => this._sortPending.direction === 'asc' ? a[this._sortPending.active].toString().localeCompare(b[this._sortPending.active].toString()) : b[this._sortPending.active].toString().localeCompare(a[this._sortPending.active].toString()));
  }

  getFilter(): any {
    return { OsbId: this.id };
  }

  refreshItems() {
    this.isLoading = true;

    this.offlineService.getOsbPaymentList(this.getFilter()).subscribe(
      {
        next: data => {
          this.isLoading = false;
          data.data.forEach(x => {
            x.audit_date_time = x.payment_status == "Confirmed" ? x.audit_date_time : '';
            x.supplier_amount = x.supplier_currency + " " + x.supplier_amount;
          });
          this.dataList = data.data;
          this.AlldataList = data.data;
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
    this.matDialog.open(PaymentEntryComponent, {
      data: { Obs_id: this.id, agent_currency_id: this.agent_currency_id },
      disableClose: true
    }).afterClosed().subscribe((res) => {
      if (res) {
        this.alertService.showToast('success', 'New record added', 'top-right', true);
        this.refreshItems();
      }
    });
  }

  editInternal(record): void {
    this.matDialog.open(PaymentEntryComponent, {
      data: { data: record, Obs_id: this.id, agent_currency_id: this.agent_currency_id },
      disableClose: true
    }).afterClosed().subscribe((res) => {
      if (res) {
        this.alertService.showToast('success', 'Record updated', 'top-right', true);
        this.refreshItems();
      }
    });
  }

  deleteInternal(record): void {
    const label: string = 'Delete Payment Entry'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + '?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.accountService.delete(record.id).subscribe({
          next: () => {
            this.alertService.showToast('success', "Payment entry has been deleted!", "top-right", true);
            this.refreshItems();
          }, error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
          }
        })
      }
    })
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.mysearchInputControl.value)
      return `no search results found for \'${this.mysearchInputControl.value}\'.`;
    else return 'No data to display';
  }

}
