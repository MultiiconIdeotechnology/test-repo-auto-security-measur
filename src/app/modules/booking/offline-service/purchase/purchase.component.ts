import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
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
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AppConfig } from 'app/config/app-config';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { module_name } from 'app/security';
import { OfflineserviceService } from 'app/services/offlineservice.service';
import { Subject } from 'rxjs';
import { PurchaseEntryComponent } from './purchase-entry/purchase-entry.component';
import { DownloadDocumentComponent } from './download-document/download-document.component';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.scss'],
  styles: [`
  .tbl-grid {
    grid-template-columns: 40px 80px 140px 150px 140px 130px 140px;
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
export class PurchaseComponent extends BaseListingComponent implements AfterViewInit {

  @ViewChild('tabGroup') tabGroup;
  @ViewChild(MatSort) public _sortPending: MatSort;
  @Input() id: string;
  @Input() isInvoiceGenerated: boolean;

  module_name = module_name.Purchase
  dataList: any[] = [];
  AlldataList: any[] = [];
  appConfig = AppConfig;
  mysearchInputControl = new FormControl('');

  public key: any;
  public sortColumn: any;
  public sortDirection: any;
  Mainmodule: any;
  isLoading = false;
  public _unsubscribeAll: Subject<any> = new Subject<any>();

  columns = [
    { key: 'supplier_invoice', name: 'Invoice', is_date: false, date_formate: '', is_sortable: false, class: 'header-center-view', isicon: true },
    { key: 'service_type', name: 'Service Type', is_date: false, date_formate: '', is_sortable: true, class: '', tooltip: false },
    { key: 'supplier_name', name: 'Supplier', is_date: false, date_formate: '', is_sortable: true, class: '', tooltip: true },
    { key: 'purchase_amount', name: 'Amount', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', tooltip: false },
    { key: 'roe', name: 'ROE', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', tooltip: false },
    { key: 'entry_date_time', name: 'Entry Date', is_date: true, date_formate: 'dd-MM-yyyy HH:mm', is_sortable: true, class: '' },
  ]
  cols = [];

  constructor(
    private conformationService: FuseConfirmationService,
    private offlineService: OfflineserviceService,
    private matDialog: MatDialog,
  ) {
    super(module_name.Purchase)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'entry_date_time';
    this.sortDirection = 'desc';
    this.Mainmodule = this
  }

  ngOnInit(): void {
    this.refreshItems();

    this.mysearchInputControl.valueChanges.subscribe(val => {
      if (!val || val.trim() == '')
        this.dataList = this.AlldataList
      else
        this.dataList = this.AlldataList.filter(x => x.service_type.toLowerCase().includes(val.toLowerCase()) || x.supplier_name.toLowerCase().includes(val.toLowerCase()) ||
          x.purchase_amount.toLowerCase().includes(val.toLowerCase()) || x.roe.toString().toLowerCase().includes(val.toLowerCase()) || x.entry_date_time.toString().toLowerCase().includes(val.toLowerCase()))
    })
  }

  refreshItems() {
    this.isLoading = true;
    const filterReq = { OsbId: this.id }
    this.offlineService.getOsbPurchaseList(filterReq).subscribe(
      {
        next: data => {
          this.isLoading = false;
          this.dataList = data.data;

          this.dataList.forEach(x => {
            x.purchase_amount = x.currency_short_code + " " + x.purchase_amount
          });

          this.AlldataList = cloneDeep(this.dataList);

        }, error: err => {
          this.alertService.showToast('error', err);
          this.isLoading = false;
        }
      }
    );
  }

  viewInternal(record): void {
    this.matDialog.open(PurchaseEntryComponent, {
      data: { data: record, readonly: true },
      disableClose: true
    })
  }

  createInternal(): void {
    this.matDialog.open(PurchaseEntryComponent,
      {
        data: { Obs_id: this.id },
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

  editInternal(record): void {
    this.matDialog.open(PurchaseEntryComponent, {
      data: { data: record, Obs_id: this.id, readonly: false },
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.alertService.showToast('success', "Record modified", "top-right", true);
        this.refreshItems();
      }
    })
  }

  deleteInternal(record): void {
    const label: string = 'Delete Purchase Entry'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + '?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.offlineService.deletePurchase(record.id).subscribe({
          next: () => {
            this.alertService.showToast('success', "Purchase entry has been deleted!", "top-right", true);
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

  downloadfile(data: string) {
    window.open(data, '_blank')
  }

  supplierInvoice(data: any) {
    // if (data.supplier_invoice)
    //   this.downloadfile(data.supplier_invoice);
    // else {
    data['from'] = "Supplier Invoice"
    this.matDialog.open(DownloadDocumentComponent, {
      data: { data: data, Obs_id: this.id, isInvoiceGenerated: this.isInvoiceGenerated }
    }).afterClosed().subscribe(x => {
      if (x)
        this.refreshItems();
    })
    // }
  }

  supplierConfirmation(data: any) {
    // if (data.supplier_confirmation_proof)
    //   this.downloadfile(data.supplier_confirmation_proof);
    // else {
    data['from'] = "Supplier Confirmation"
    this.matDialog.open(DownloadDocumentComponent, {
      data: { data: data, Obs_id: this.id, isInvoiceGenerated: this.isInvoiceGenerated }
    }).afterClosed().subscribe(x => {
      if (x)
        this.refreshItems();
    })
    // }
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.mysearchInputControl.value)
      return `no search results found for \'${this.mysearchInputControl.value}\'.`;
    else return 'No data to display';
  }

}
