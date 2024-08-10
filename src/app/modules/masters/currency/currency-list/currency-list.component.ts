import { filter_module_name, module_name } from 'app/security';
import { Component } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CurrencyEntryComponent } from '../currency-entry/currency-entry.component';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CurrencyService } from 'app/services/currency.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { Subscription } from 'rxjs';
import { UserService } from 'app/core/user/user.service';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
  selector: 'app-currency-list',
  templateUrl: './currency-list.component.html',
  styles: [],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    PrimeNgImportsModule
  ],
})
export class CurrencyListComponent extends BaseListingComponent {
  private settingsUpdatedSubscription: Subscription;
  filter_table_name = filter_module_name.currency_master;

  module_name = module_name.currency
  dataList = [];
  isFilterShow: boolean = false;

  columns = [
    { key: 'currency', name: 'Currency', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, tooltip: true },
    { key: 'currency_short_code', name: 'Short Code', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: 'center', indicator: false, tooltip: true },
    { key: 'currency_symbol', name: 'Symbol', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, align: 'center', indicator: false, tooltip: true },
    { key: '.', name: '', is_date: false, date_formate: '', is_sortable: false, class: '', is_sticky: false, align: 'center', indicator: false, tooltip: true },
  ]
  cols = [];

  constructor(
    private currencyService: CurrencyService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    public _userService: UserService,
    public _filterService: CommonFilterService,

  ) {
    super(module_name.currency)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'currency';
    this.Mainmodule = this
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit() {
      this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
        this.sortColumn = resp['sortColumn'];
        this.primengTable['_sortField'] = resp['sortColumn'];
        Object.assign(this.primengTable['filters'], resp['table_config']);
        this.isFilterShow = true;
        this.primengTable._filter();
      });
  }

  refreshItems(event?: any): void {
    this.isLoading = true;
    this.currencyService.getcurrencyList(this.getNewFilterReq(event)).subscribe({
      next: data => {
        this.isLoading = false;
        this.dataList = data.data;
        this.totalRecords = data.total;
      }, error: err => {
        this.alertService.showToast('error', err, 'top-right', true)
        this.isLoading = false;
      }
    })
  }

  createInternal(model): void {
    this.matDialog.open(CurrencyEntryComponent, {
      data: null,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.alertService.showToast('success', "New record added", "top-right", true);
        this.refreshItems();
      }
    })
  }

  editInternal(record): void {
    this.matDialog.open(CurrencyEntryComponent, {
      data: { data: record, readonly: false },
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.alertService.showToast('success', "Record modified", "top-right", true);
        this.refreshItems();
      }
    })
  }

  viewInternal(record): void {
    this.matDialog.open(CurrencyEntryComponent, {
      data: { data: record, readonly: true },
      disableClose: true
    })
  }

  deleteInternal(record): void {
    const label: string = 'Delete Currency'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.currency + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.currencyService.delete(record.id).subscribe({
          next: () => {
            this.alertService.showToast('success', "Currency has been deleted!", "top-right", true);
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
    else if (this.searchInputControl.value)
      return `no search results found for \'${this.searchInputControl.value}\'.`;
    else return 'No data to display';
  }

  ngOnDestroy() {
    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
    }
  }
}
