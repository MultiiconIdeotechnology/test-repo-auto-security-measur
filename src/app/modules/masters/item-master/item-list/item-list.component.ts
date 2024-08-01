import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BaseListingComponent } from 'app/form-models/base-listing';
import { module_name } from 'app/security';
import { ItemService } from 'app/services/item.service';
import { ItemEntryComponent } from '../item-entry/item-entry.component';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss'],
  styles: [`
  .tbl-grid {
    grid-template-columns:  40px 100px 140px 120px 210px;
  }
  `],
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
    MatPaginatorModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
  ],
})
export class ItemListComponent extends BaseListingComponent {

  module_name = module_name.itemMaster
  dataList = [];
  total = 0;

  columns = [
    { key: 'item_code', name: 'Item Code', is_date: false, date_formate: '', is_boolean: false, is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, tooltip: true },
    { key: 'item_name', name: 'Item Name', is_date: false, date_formate: '', is_boolean: false, is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, tooltip: true },
    { key: 'is_auto_enabled ', name: 'Auto Enabled', is_date: false, date_formate: '', is_boolean: true, is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, tooltip: false },
    { key: 'entry_date_time', name: 'Entry Date', is_date: true, date_formate: 'dd-MM-yyyy', is_boolean: false, is_sortable: true, class: '', is_sticky: false, align: '', indicator: false, tooltip: false },
  ]
  cols = [];

  constructor(
    private itemService: ItemService,
    private conformationService: FuseConfirmationService,
    private matDialog: MatDialog,
  ) {
    super(module_name.itemMaster)
    this.cols = this.columns.map(x => x.key);
    this.key = this.module_name;
    this.sortColumn = 'entry_date_time';
    this.sortDirection = 'desc';
    this.Mainmodule = this
  }

  refreshItems(): void {
    this.isLoading = true;
    this.itemService.getItemMasterList(this.getFilterReq()).subscribe({
      next: data => {
        this.isLoading = false;
        this.dataList = data.data;
        this._paginator.length = data.total;
      }, error: err => {
        this.alertService.showToast('error', err, 'top-right', true)
        this.isLoading = false;
      }
    })
  }

  createInternal(model): void {
    this.matDialog.open(ItemEntryComponent, {
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
      .open(ItemEntryComponent, {
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
    const label: string = 'Delete Item'
    this.conformationService.open({
      title: label,
      message: 'Are you sure to ' + label.toLowerCase() + ' ' + record.item_name + ' ?'
    }).afterClosed().subscribe(res => {
      if (res === 'confirmed') {
        this.itemService.delete(record.id).subscribe({
          next: () => {
            this.alertService.showToast('success', "Item has been deleted!", "top-right", true);
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
    this.masterService.setData(this.key, this)
  }

}