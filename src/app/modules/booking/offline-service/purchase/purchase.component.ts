import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {  MatDialog, MatDialogModule } from '@angular/material/dialog';
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
import { EntityService } from 'app/services/entity.service';
import { OfflineserviceService } from 'app/services/offlineservice.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { Subject } from 'rxjs';
import { PurchaseEntryComponent } from './purchase-entry/purchase-entry.component';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.scss'],
  styles: [`
  .tbl-grid {
    grid-template-columns: 40px 200px 200px 200px 210px 130px 200px 160px 100px 100px 130px;
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
export class PurchaseComponent extends BaseListingComponent {

  @ViewChild('tabGroup') tabGroup;
  @ViewChild(MatPaginator) public _paginatorPending: MatPaginator;
  @ViewChild(MatSort) public _sortPending: MatSort;
  @Input() id: string;
  @Input() isInvoiceGenerated: boolean;

  module_name = module_name.Purchase
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
    { key: 'supplier_booking_ref_no', name: 'Ref.No', is_date: false, date_formate: '', is_sortable: true, class: '', tooltip: true },
    { key: 'service_type', name: 'Service Type', is_date: false, date_formate: '', is_sortable: true, class: '', tooltip: true },
    { key: 'service_particular', name: 'Service Particular', is_date: false, date_formate: '', is_sortable: true, class: '' },
    { key: 'service_remark', name: 'Remark', tooltip: true, is_date: false, date_formate: '', is_sortable: true, class: '' },
    { key: 'service_date', name: 'Service Date', is_date: true, date_formate: 'dd-MM-yyyy', is_sortable: true, class: '' },
    { key: 'supplier_name', name: 'Supplier Name', is_date: false, date_formate: '', is_sortable: true, class: '', tooltip: true },
    { key: 'purchase_amount', name: 'Purchase Amount', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', tooltip: true },
    { key: 'currency_short_code', name: 'Currency', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', tooltip: true },
    { key: 'roe', name: 'ROE', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', tooltip: true },
    { key: 'supplier_invoice', name: 'Invoice', is_date: false, date_formate: '', is_sortable: false, class: 'header-center-view', isicon: true },
  ]
  cols = [];

  constructor(
    private conformationService: FuseConfirmationService,
    private offlineService: OfflineserviceService,
    private matDialog: MatDialog,
    private entityService: EntityService,
  ) {
    super(module_name.Purchase)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'supplier_booking_ref_no';
    this.sortDirection = 'asc';
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

    this.offlineService.getOsbPurchaseList(this.getFilter()).subscribe(
      {
        next: data => {
          this.isLoading = false;
          this.dataList = data.data;

          this.dataList.forEach(x => {
            x.recharge_amount = x.currency + " " + x.recharge_amount
          });
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

  downloadfile(data: string) {
    window.open(data, '_blank')
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

}
