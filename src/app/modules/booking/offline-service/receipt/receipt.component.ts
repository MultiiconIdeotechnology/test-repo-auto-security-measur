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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppConfig } from 'app/config/app-config';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { module_name } from 'app/security';
import { OfflineserviceService } from 'app/services/offlineservice.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { Subject } from 'rxjs';
import { ReceiptEntryComponent } from './receipt-entry/receipt-entry.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AccountService } from 'app/services/account.service';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styles: [`
  .tbl-grid {
    grid-template-columns: 40px 180px 120px 110px 120px 150px;
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
export class ReceiptComponent extends BaseListingComponent {

  @ViewChild('tabGroup') tabGroup;
  @ViewChild(MatSort) public _sortPending: MatSort;
  @Input() id: string;
  @Input() agent_currency_id: string
  @Input() isInvoiceGenerated: boolean;
  mysearchInputControl = new FormControl('');

  module_name = module_name.OsbReceipt
  dataList = [];
  AlldataList = [];
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
    { key: 'receipt_ref_no', name: 'Reference Number', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: true },
    { key: 'payment_amount', name: 'Amount', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', is_sticky: false, indicator: false, is_boolean: false, tooltip: false, isamount: true },
    { key: 'roe', name: 'ROE', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'mode_of_payment', name: 'MOP', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
    { key: 'receipt_request_date', name: 'Entry Date', is_date: true, date_formate: 'dd-MM-yyyy HH:mm', is_sortable: true, class: '', is_sticky: false, indicator: false, is_boolean: false, tooltip: false },
  ]
  cols = [];

  constructor(
    private offlineService: OfflineserviceService,
    private conformationService: FuseConfirmationService,
    private accountService: AccountService,
    private matDialog: MatDialog,
  ) {
    super(module_name.OsbReceipt)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'receipt_request_date';
    this.sortDirection = 'desc';
    this.Mainmodule = this
  }

  ngOnInit(): void {
    this.mysearchInputControl.valueChanges.subscribe(val => {
      if (!val || val.trim() == '')
        this.dataList = this.AlldataList
      else
        this.dataList = this.AlldataList.filter(x => x.receipt_ref_no.toLowerCase().includes(val.toLowerCase()) || x.mode_of_payment.toLowerCase().includes(val.toLowerCase()) ||
          x.payment_amount.toLowerCase().includes(val.toLowerCase()) || x.roe.toString().toLowerCase().includes(val.toLowerCase()) || x.receipt_request_date.toString().toLowerCase().includes(val.toLowerCase()))
    })

    this.refreshItems();
  }

  refreshItems() {
    this.isLoading = true;
    this.offlineService.getOsbReceiptList({ OsbId: this.id }).subscribe({
      next: data => {
        this.isLoading = false;
        data.data.forEach(x => {
          x.audit_date_time = x.receipt_status == "Confirmed" ? x.audit_date_time : '';
          x.payment_amount = x.payment_currency + " " + x.payment_amount;
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
    this.matDialog.open(ReceiptEntryComponent, {
      data: { data: record, readonly: true },
      disableClose: true
    })
  }

  createInternal(): void {
    this.matDialog.open(ReceiptEntryComponent,
      {
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
    this.matDialog.open(ReceiptEntryComponent, {
      data: { data: record, Obs_id: this.id, agent_currency_id: this.agent_currency_id },
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.alertService.showToast('success', "Record modified", "top-right", true);
        this.refreshItems();
      }
    })
  }

  deleteInternal(record): void {
    const label: string = 'Delete Receipt Entry'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + '?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.accountService.Receiptdelete(record.id).subscribe({
          next: () => {
            this.alertService.showToast('success', "Receipt entry has been deleted!", "top-right", true);
            this.refreshItems();
          }, error: (err) => {
            this.alertService.showToast('error', err, 'top-right', true);
          }
        })
      }
    })
  }

  shortData() {
    this.dataList.sort((a, b) => this._sortPending.direction === 'asc' ? a[this._sortPending.active].toString().localeCompare(b[this._sortPending.active].toString()) : b[this._sortPending.active].toString().localeCompare(a[this._sortPending.active].toString()));
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.mysearchInputControl.value)
      return `no search results found for \'${this.mysearchInputControl.value}\'.`;
    else return 'No data to display';
  }

}
