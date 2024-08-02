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
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styles: [`
  .tbl-grid {
    grid-template-columns: 40px 130px 110px 130px 100px 140px 130px;
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
  @ViewChild(MatSort) public _sortPending: MatSort;
  searchInputControl = new FormControl('');

  @Input() id: string
  @Input() agent_currency_id: string
  @Input() currency_short_code: boolean;
  @Input() isInvoiceGenerated: boolean;

  module_name = module_name.Sales
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
    { key: 'service_type', name: 'Service Type', is_date: false, date_formate: '', is_sortable: true, class: '', align: '', tooltip: true },
    { key: 'recharge_amount', name: 'Sale Amount', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', align: '', tooltip: false },
    { key: 'service_charge', name: 'Service Charge', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', align: '', tooltip: false },
    { key: 'total_tax', name: 'Tax', is_date: false, date_formate: '', is_sortable: true, class: 'header-center-view', align: '', tooltip: false },
    { key: 'net_sale_amount', name: 'Net Sale Amount', is_date: false, date_formate: '', is_sortable: true, class: 'header-right-view', align: '', tooltip: false },
    { key: 'entry_date_time', name: 'Entry Date', is_date: true, date_formate: 'dd-MM-yyyy HH:mm', is_sortable: true, class: '', align: '', },
  ]
  cols = [];

  constructor(
    private conformationService: FuseConfirmationService,
    private offlineService: OfflineserviceService,
    private matDialog: MatDialog,
    private alertService: ToasterService,
  ) {
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'entry_date_time';
    this.sortDirection = 'desc';
    this.Mainmodule = this
  }

  ngOnInit(): void {
    this.mysearchInputControl.valueChanges.subscribe(val => {
      if (!val || val.trim() == '')
        this.dataList = this.AlldataList
      else
        this.dataList = this.AlldataList.filter(x => x.service_type.toLowerCase().includes(val.toLowerCase()) || x.total_tax.toString().toLowerCase().includes(val.toLowerCase()) || x.net_sale_amount.toString().toLowerCase().includes(val.toLowerCase()) ||
          x.recharge_amount.toLowerCase().includes(val.toLowerCase()) || x.service_charge.toString().toLowerCase().includes(val.toLowerCase()) || x.entry_date_time.toString().toLowerCase().includes(val.toLowerCase()))
    })

    this.refreshItemsSales();
  }

  refreshItemsSales() {
    this.isLoading = true;
   
    this.offlineService.getOsbSalesList({OsbId: this.id}).subscribe(
      {
        next: data => {
          this.isLoading = false;
          this.dataList = data.data;

          this.dataList.forEach(x => {
            x.recharge_amount = x.agent_currency + " " + x.sale_amount;
            x.service_charge = x.service_charge || "0";
            x.total_tax = x.total_tax || "0";
          });
          this.AlldataList = cloneDeep(this.dataList);
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
      data: { data: record, readonly: true, currency_short_code: this.currency_short_code },
      disableClose: true
    })
  }

  create(): void {
    if (!Security.hasNewEntryPermission(module_name.Sales)) {
      return this.alertService.showToast('error', messages.permissionDenied);
    }

    this.matDialog.open(SalesEntryComponent,
      {
        data: { Obs_id: this.id, agent_currency_id: this.agent_currency_id, currency_short_code: this.currency_short_code },
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
      data: { data: record, Obs_id: this.id, readonly: false, agent_currency_id: this.agent_currency_id, currency_short_code: this.currency_short_code },
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

  shortData() {
    this.dataList.sort((a, b) => this._sortPending.direction === 'asc' ? a[this._sortPending.active].toString().localeCompare(b[this._sortPending.active].toString()) : b[this._sortPending.active].toString().localeCompare(a[this._sortPending.active].toString()));
  }

  downloadfile(data: string) {
    window.open(data, '_blank')
  }

  getNodataText(): string {
    if (this.isLoading)
      return 'Loading...';
    else if (this.mysearchInputControl.value)
      return `no search results found for \'${this.mysearchInputControl.value}\'.`;
    else return 'No data to display';
  }

}
