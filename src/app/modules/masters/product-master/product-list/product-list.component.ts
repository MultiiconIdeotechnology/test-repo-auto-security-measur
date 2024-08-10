import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { filter_module_name, module_name } from 'app/security';
import { ProductService } from 'app/services/product.service';
import { ProductEntryComponent } from '../product-entry/product-entry.component';
import { ItemListDialogComponent } from '../item-list-dialog/item-list-dialog.component';
import { PrimeNgImportsModule } from 'app/_model/imports_primeng/imports';
import { Subscription } from 'rxjs';
import { CommonFilterService } from 'app/core/common-filter/common-filter.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
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
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    PrimeNgImportsModule
  ],
})
export class ProductListComponent extends BaseListingComponent {

  module_name = module_name.product;
  filter_table_name = filter_module_name.products_master;
  private settingsUpdatedSubscription: Subscription;
  dataList = [];
  total = 0;
  isFilterShow: boolean = false;

  columns = [
    { key: 'product_name', name: 'Product Name', is_date: false, date_formate: '', is_boolean: false, is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, tooltip: true, applied: false },
    { key: 'count_to_length', name: 'Items', is_date: false, date_formate: '', is_boolean: false, is_sortable: true, class: 'header-center-view', is_sticky: false, align: '', indicator: false, tooltip: true, applied: true, },
    { key: 'one_time_cost', name: 'One Time Cost', is_date: false, date_formate: '', is_boolean: false, is_sortable: true, class: 'header-center-view', is_sticky: false, align: '', indicator: false, tooltip: false, applied: false },
    { key: 'product_expiry', name: 'Expiry', is_date: false, date_formate: '', is_boolean: false, is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, tooltip: false, applied: false },
    { key: 'is_amc_required', name: 'AMC Required', is_date: false, date_formate: '', is_boolean: true, is_sortable: true, class: 'header-center-view', is_sticky: false, align: '', indicator: false, tooltip: false, applied: false },
    { key: 'amc_amount', name: 'AMC Amount', is_date: false, date_formate: '', is_boolean: false, is_sortable: true, class: 'header-center-view', is_sticky: false, align: '', indicator: false, tooltip: false, applied: false },
    { key: 'max_installment', name: 'Max Installment', is_date: false, date_formate: '', is_boolean: false, is_sortable: true, class: 'header-center-view', is_sticky: false, align: '', indicator: false, tooltip: false, applied: false },
  ];

  selectedAction:string;
  actionList: any[] = [
      { label: 'Yes', value: true },
      { label: 'No', value: false },
  ]

  constructor(
    private productService: ProductService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
    public _filterService: CommonFilterService
  ) {
    super(module_name.product)
    // this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'product_name';
    this.sortDirection = 'desc';
    this.Mainmodule = this;
    this._filterService.applyDefaultFilter(this.filter_table_name);
  }

  ngOnInit(): void {
    this.settingsUpdatedSubscription = this._filterService.drawersUpdated$.subscribe((resp) => {
        this.sortColumn = resp['sortColumn'];
        this.primengTable['_sortField'] = resp['sortColumn'];
        this.primengTable['filters'] = resp['table_config'];
        this.isFilterShow = true;
        this.primengTable._filter();
    });
}

ngAfterViewInit(){
  // Defult Active filter show
  if(this._filterService.activeFiltData && this._filterService.activeFiltData.grid_config) {
      this.isFilterShow = true;
      let filterData = JSON.parse(this._filterService.activeFiltData.grid_config);
      this.primengTable['filters'] = filterData['table_config'];
  }
}

  //   const index = this.checkinTemp.indexOf(item);
  // this.checkinTemp.splice(index, 1);

  refreshItems(event?:any): void {
    this.isLoading = true;
    this.productService.getTecProductMasterList(this.getNewFilterReq(event)).subscribe({
      next: data => {
        this.isLoading = false;
        this.dataList = data.data;
        this.totalRecords = data.total;
        this.dataList?.forEach((row) => {
          row['count_to_length'] = row['count'].length;
        });
      }, error: err => {
        this.alertService.showToast('error', err, 'top-right', true)
        this.isLoading = false;
      }
    })
  }

  opanItemListDialog(rowData: any) {
    const assignedToList = rowData['count'];
    if (assignedToList.length <= 0) return;
    this.matDialog.open(ItemListDialogComponent, {
      disableClose: true,
      data: assignedToList,
    });
  }

  createInternal(model): void {
    this.matDialog.open(ProductEntryComponent, {
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
    this.matDialog
      .open(ProductEntryComponent, {
        data: { data: record, readonly: false },
        disableClose: true,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.alertService.showToast('success', "Record modified", "top-right", true);
          this.refreshItems();
        }
      });
  }

  deleteInternal(record): void {

    const label: string = 'Delete Product'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.product_name + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.productService.delete(record.id).subscribe({
          next: () => {
            this.alertService.showToast('success', "Product has been deleted!", "top-right", true);
            // this.dataList.splice(index, 1)
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

  ngOnDestroy(): void {
    // this.masterService.setData(this.key, this)

    if (this.settingsUpdatedSubscription) {
      this.settingsUpdatedSubscription.unsubscribe();
      this._filterService.activeFiltData = {};
    }
  }

}
