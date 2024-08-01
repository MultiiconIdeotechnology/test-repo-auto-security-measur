import { MatMenuModule } from '@angular/material/menu';
import { Component, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { module_name } from 'app/security';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDividerModule } from '@angular/material/divider';
import { ProductFixDepartureEntryComponent } from '../product-fix-departure-entry/product-fix-departure-entry.component';
import { ProductFixDepartureService } from 'app/services/product-fix-departure.service';
import { ToasterService } from 'app/services/toaster.service';

@Component({
  selector: 'app-product-fix-departure',
  templateUrl: './product-fix-departure.component.html',
  styleUrls: ['./product-fix-departure.component.scss'],
  standalone:true,
  imports:[
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    NgIf,
    NgFor,
    DatePipe,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule
  ]
})
export class ProductFixDepartureComponent extends BaseListingComponent{

  module_name = module_name.productfixdeparture
  columns = [
    { key: 'actions', name: '#', is_date: false, date_formate: '', is_sortable: false, class: '', is_sticky: true, width: '10', align: 'center', indicator: false,is_required: false, is_included:false,is_boolean:false },
    { key: 'product_name', name: 'Product Name', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, width: '60', align: '', indicator: false,is_required: false, is_included:false,is_boolean:false },
    { key: 'departure_city_name', name: 'Departure City', is_date: false, date_formate: '', is_sortable: true, class: '', is_sticky: false, width: '60', align: '', indicator: false,is_required: false, is_included:false,is_boolean:false },
    { key: 'departure_date', name: 'Departure Date', is_date: true, date_formate: 'dd-MM-YYYY HH:mm', is_sortable: true, class: '', is_sticky: false, width: '60', align: '', indicator: false,is_required: false, is_included:false,is_boolean:false },
    { key: '.', name: '', is_date: false, date_formate: '', is_sortable: false, class: '', is_sticky: false, width: '180', align: '', indicator: false },
  ]
  cols = [];

  constructor(
    private productFixDepartureService: ProductFixDepartureService,
    private conformationService: FuseConfirmationService,
    private toasterService: ToasterService,
    private matDialog: MatDialog,
  ) {
    super(module_name.productfixdeparture)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'product_name';
    this.sortDirection = 'asc';
    this.Mainmodule = this
  }

  refreshItems(): void {
    this.isLoading = true;
    this.productFixDepartureService.getProductFixDepartureList(this.getFilterReq()).subscribe({
      next: data => {
        this.isLoading = false;
        this.dataSource.data = data.data;
        this._paginator.length = data.total;
      }, error: err => {
        this.toasterService.showToast('error', err)
        this.isLoading = false;
      }
    })
  }
  createInternal(model): void {
    this.matDialog.open(ProductFixDepartureEntryComponent, {
      data: null,
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res) {
        this.alertService.showToast('success', "Product Fix Departure has been created!", "top-right", true);
        this.refreshItems();
      }
    })
  }

  editInternal(record): void {
    this.matDialog.open(ProductFixDepartureEntryComponent, {
      data: {data: record, readonly: false},
      disableClose: true
    }).afterClosed().subscribe(res => {
      if (res){
        this.alertService.showToast('success', "Product Fix Departure has been Modified!", "top-right", true);
        this.refreshItems();
      }
    })
  }

  viewInternal(record): void {
    this.matDialog.open(ProductFixDepartureEntryComponent, {
      data: {data: record, readonly: true},
      disableClose: true
    })
  }

  deleteInternal(record): void {
    const label: string = 'Delete Hotel'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.hotel_name + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.productFixDepartureService.delete(record.id).subscribe({
          next: () => {
            this.alertService.showToast('success', "Product Fix Departure has been deleted!", "top-right", true);
            this.refreshItems()
          },
           error: err => {
            this.toasterService.showToast('error', err)
            this.isLoading = false;
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
    this.masterService.setData(this.key, this)
  }
}
