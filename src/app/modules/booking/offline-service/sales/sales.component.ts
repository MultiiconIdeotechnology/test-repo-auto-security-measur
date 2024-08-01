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
import { Security, messages, module_name } from 'app/security';
import { EntityService } from 'app/services/entity.service';
import { OfflineserviceService } from 'app/services/offlineservice.service';
import { GridUtils } from 'app/utils/grid/gridUtils';
import { Subject, takeUntil } from 'rxjs';
import { SalesEntryComponent } from './sales-entry/sales-entry.component';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  styles: [`
  .tbl-grid {
    grid-template-columns: 40px 160px 200px 170px 130px 140px 130px 140px 100px 100px 100px 100px 110px 160px;
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
export class SalesComponent {

  @ViewChild('tabGroup') tabGroup;
  @ViewChild(MatPaginator) public _paginatorPending: MatPaginator;
  @ViewChild(MatSort) public _sortPending: MatSort;
  searchInputControl = new FormControl('');

  @Input() id: string
  @Input() agent_currency_id: string
  @Input() isInvoiceGenerated: boolean;

  module_name = module_name.Sales
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
    { key: 'service_type', name: 'Service Type', is_date: false, date_formate: '', is_sortable: true, class: '', align: '', tooltip: true },
    { key: 'service_particular', name: 'Service Particular', is_date: false, date_formate: '', is_sortable: true, class: '', align: '', tooltip: true },
    { key: 'service_remark', name: 'Remark', tooltip: true, is_date: false, date_formate: '', is_sortable: true, class: '', align: '', },
    { key: 'service_date', name: 'Service Date', is_date: true, date_formate: 'dd-MM-yyyy', is_sortable: true, class: '', align: '', },
    { key: 'agent_currency', name: 'Agent Currency', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', align: '', tooltip: true },
    { key: 'sale_amount', name: 'Sale Amount', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', align: '', tooltip: true },
    { key: 'service_charge', name: 'Service Charge', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', align: '', tooltip: true },
    { key: 'sgst', name: 'SGST', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', align: '', tooltip: true },
    { key: 'cgst', name: 'CGST', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', align: '', tooltip: true },
    { key: 'igst', name: 'IGST', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', align: '', tooltip: true },
    { key: 'vat', name: 'VAT', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', align: '', tooltip: true },
    { key: 'total_tax', name: 'Total Tax', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', align: '', tooltip: true },
    { key: 'net_sale_amount', name: 'Net Sale Amount', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', align: '', tooltip: true },
  ]
  cols = [];

  constructor(
    private conformationService: FuseConfirmationService,
    private offlineService: OfflineserviceService,
    private matDialog: MatDialog,
    private alertService: ToasterService,
    private entityService: EntityService,
  ) {
    // super(module_name.wallet)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'service_date';
    this.sortDirection = 'asc';
    this.Mainmodule = this
  }

  ngOnInit(): void {
    this.searchInputControl.valueChanges
      .subscribe(() => {
        GridUtils.resetPaginator(this._paginatorPending);
        this.refreshItemsSales();
      });

    this.entityService.onWalletAuditedCall().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (item) => {
        this.refreshItemsSales();
      }
    })
    this.refreshItemsSales();
  }

  refreshItemsSales() {
    this.isLoading = true;
    const filterReq = GridUtils.GetFilterReq(
      this._paginatorPending,
      this._sortPending,
      this.searchInputControl.value, "service_date", 1
    );

    filterReq["OsbId"] = this.id;
    this.offlineService.getOsbSalesList(filterReq).subscribe(
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

  view(record): void {
    if (!Security.hasViewDetailPermission(module_name.Sales)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(SalesEntryComponent, {
      data: { data: record, readonly: true },
      disableClose: true
    })
  }

  create(): void {
    if (!Security.hasNewEntryPermission(module_name.Sales)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(SalesEntryComponent,
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
          this.refreshItemsSales();
        }
      });
  }

  edit(record): void {
    if (!Security.hasEditEntryPermission(module_name.Sales)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(SalesEntryComponent, {
      data: { data: record, Obs_id: this.id, readonly: false, agent_currency_id: this.agent_currency_id },
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.alertService.showToast('success', "Record modified", "top-right", true);
        this.refreshItemsSales();
      }
    })
  }

  delete(record): void {
    if (!Security.hasDeleteEntryPermission(module_name.Sales)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    const label: string = 'Delete Sales Entry'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + '?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.offlineService.deleteSales(record.id).subscribe({
          next: () => {
            this.alertService.showToast('success', "Sales entry has been deleted!", "top-right", true);
            this.refreshItemsSales();
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
